import { showToast } from './toasts.js';

const EVENTS_INDEX_PATH = './events/index.json';
const MAX_SUGGESTIONS = 8;
const templateImageCache = new Map();

const resolveCertificatePath = (rawPath) => {
  if (!rawPath) {
    return '';
  }

  if (/^(https?:|data:)/i.test(rawPath)) {
    return rawPath;
  }

  const pathname = window.location.pathname;
  const marker = '/certificates';
  const markerIndex = pathname.indexOf(marker);
  const prefix = markerIndex >= 0 ? pathname.slice(0, markerIndex) : '';
  const certificatesBase = `${window.location.origin}${prefix}${marker}/`;

  if (rawPath.startsWith('/')) {
    return `${window.location.origin}${prefix}${rawPath}`;
  }

  return new URL(rawPath, certificatesBase).toString();
};

const MONTH_ABBREVIATIONS = {
  jan: '01',
  feb: '02',
  mar: '03',
  apr: '04',
  may: '05',
  jun: '06',
  jul: '07',
  aug: '08',
  sep: '09',
  oct: '10',
  nov: '11',
  dec: '12'
};

const getMonthCode = (value) => {
  if (!value || typeof value !== 'string') {
    return '01';
  }

  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) {
    return String(parsed.getMonth() + 1).padStart(2, '0');
  }

  const monthToken = value.trim().toLowerCase().slice(0, 3);
  return MONTH_ABBREVIATIONS[monthToken] || '01';
};

const getEventCode = (eventConfig) => {
  const prefix = typeof eventConfig.idPrefix === 'string' ? eventConfig.idPrefix.toUpperCase() : '';
  const prefixMatch = prefix.match(/^HU-([A-Z]+)/);

  if (prefixMatch?.[1]) {
    return prefixMatch[1];
  }

  const words = String(eventConfig.eventName || '')
    .toUpperCase()
    .replace(/[^A-Z\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);

  if (!words.length) {
    return 'EV';
  }

  const code = words.map((word) => word[0]).join('').slice(0, 4);
  return code || 'EV';
};

const buildCertificateId = (eventConfig, participantIndex) => {
  const eventCode = getEventCode(eventConfig);
  const monthCode = getMonthCode(eventConfig.issueDate || eventConfig.eventDate);
  const participantCode = String(participantIndex + 1).padStart(3, '0');
  return `HU-${eventCode}-${monthCode}-${participantCode}`;
};

const slugifyName = (name) => name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const buildVerificationLink = (eventConfig, certId) => {
  const base = eventConfig.verificationBaseUrl || 'https://hackunion.in/certificates/verify';
  return `${base}?certificateId=${encodeURIComponent(certId)}`;
};

const fetchJson = async (path) => {
  const response = await fetch(resolveCertificatePath(path), { cache: 'no-store' });

  if (!response.ok) {
    throw new Error(`Failed to load ${path}`);
  }

  return response.json();
};

const loadTemplateImage = async (src) => {
  if (!src) {
    return null;
  }

  if (templateImageCache.has(src)) {
    return templateImageCache.get(src);
  }

  const image = new Image();
  image.decoding = 'async';
  image.loading = 'eager';

  const loader = new Promise((resolve, reject) => {
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Unable to load certificate template image: ${src}`));
  });

  image.src = src;
  templateImageCache.set(src, loader);
  return loader;
};

export const initCertificates = () => {
  const portal = document.querySelector('[data-certificates-portal]');

  if (!portal) {
    return;
  }

  const form = portal.querySelector('[data-cert-search-form]');
  const statusNode = portal.querySelector('[data-cert-status]');
  const eventField = portal.querySelector('[data-cert-event]');
  const campusField = portal.querySelector('[data-cert-campus]');
  const participantField = portal.querySelector('[data-cert-participant-input]');
  const suggestionsNode = portal.querySelector('[data-cert-suggestions]');
  const resultsNode = portal.querySelector('[data-cert-results]');
  const loadingNode = portal.querySelector('[data-cert-loading]');
  const generateButton = portal.querySelector('[data-cert-generate]');
  const archiveNode = portal.querySelector('[data-cert-archive]');
  const archiveEmptyNode = portal.querySelector('[data-cert-archive-empty]');
  const canvas = portal.querySelector('[data-cert-preview-canvas]');
  const modalImage = portal.querySelector('[data-cert-modal-image]');
  const zoomInButton = portal.querySelector('[data-cert-zoom-in]');
  const zoomOutButton = portal.querySelector('[data-cert-zoom-out]');
  const zoomResetButton = portal.querySelector('[data-cert-zoom-reset]');
  const actionPreview = portal.querySelector('[data-cert-action-preview]');
  const actionDownload = portal.querySelector('[data-cert-action-download]');

  if (
    !form || !statusNode || !eventField || !campusField || !participantField || !suggestionsNode || !resultsNode || !loadingNode || !generateButton
    || !archiveNode || !archiveEmptyNode || !canvas || !modalImage || !actionPreview || !actionDownload
    || !zoomInButton || !zoomOutButton || !zoomResetButton
  ) {
    return;
  }

  const resultFields = {
    eventName: portal.querySelector('[data-result-event]'),
    eventDate: portal.querySelector('[data-result-date]'),
    venue: portal.querySelector('[data-result-venue]'),
    organizer: portal.querySelector('[data-result-organizer]'),
    participant: portal.querySelector('[data-result-participant]'),
    certType: portal.querySelector('[data-result-type]'),
    certId: portal.querySelector('[data-result-id]'),
    issueDate: portal.querySelector('[data-result-issue]')
  };

  const context = canvas.getContext('2d');

  if (!context) {
    return;
  }

  const state = {
    events: [],
    eventConfigById: new Map(),
    participantsByEventCampus: new Map(),
    selectedEventId: '',
    selectedCampus: '',
    selectedParticipant: null,
    activeSuggestions: [],
    activeSuggestionIndex: -1,
    previewScale: 1
  };

  const actionButtons = [actionPreview, actionDownload];

  const setStatus = (message) => {
    statusNode.textContent = message;
  };

  const setLoading = (isLoading, { showSkeleton = false } = {}) => {
    loadingNode.hidden = !isLoading || !showSkeleton;
    if (isLoading && showSkeleton) {
      resultsNode.hidden = true;
    }
  };

  const setActionsEnabled = (enabled) => {
    actionButtons.forEach((button) => {
      button.disabled = !enabled;
    });
  };

  const setGenerateEnabled = (enabled) => {
    generateButton.disabled = !enabled;
  };

  const resetParticipantSelection = ({ clearInput = true } = {}) => {
    state.selectedParticipant = null;
    state.activeSuggestions = [];
    state.activeSuggestionIndex = -1;
    suggestionsNode.innerHTML = '';
    suggestionsNode.hidden = true;
    participantField.setAttribute('aria-expanded', 'false');
    if (clearInput) {
      participantField.value = '';
    }
    resultsNode.hidden = true;
    setActionsEnabled(false);
    setGenerateEnabled(false);
  };

  const setParticipantEnabled = (enabled) => {
    participantField.disabled = !enabled;
    if (!enabled) {
      participantField.value = '';
    }
  };

  const setCampusEnabled = (enabled) => {
    campusField.disabled = !enabled;
    if (!enabled) {
      campusField.value = '';
      state.selectedCampus = '';
    }
  };

  const updateArchiveSelectionState = () => {
    archiveNode.querySelectorAll('[data-cert-archive-select]').forEach((button) => {
      const isSelected = button.getAttribute('data-event-id') === state.selectedEventId;
      button.classList.toggle('is-selected', isSelected);
      button.setAttribute('aria-pressed', String(isSelected));
    });
  };

  const drawCertificate = async (eventConfig, participant) => {
    const template = eventConfig.template;
    const palette = template.palette;
    const width = Number(template.width) || 1280;
    const height = Number(template.height) || 900;
    const layout = template.layout || {};
    const textStyles = template.textStyles || {};
    const hasTemplateImage = typeof template.backgroundImage === 'string' && template.backgroundImage.trim().length > 0;
    const templateImagePath = hasTemplateImage ? resolveCertificatePath(template.backgroundImage.trim()) : '';

    canvas.width = width;
    canvas.height = height;

    if (hasTemplateImage) {
      try {
        const image = await loadTemplateImage(templateImagePath);
        context.drawImage(image, 0, 0, width, height);
      } catch {
        const gradient = context.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, palette.backgroundA);
        gradient.addColorStop(1, palette.backgroundB);
        context.fillStyle = gradient;
        context.fillRect(0, 0, width, height);
      }
    } else {
      const gradient = context.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, palette.backgroundA);
      gradient.addColorStop(1, palette.backgroundB);

      context.fillStyle = gradient;
      context.fillRect(0, 0, width, height);

      const glowA = context.createRadialGradient(width * 0.15, height * 0.18, 20, width * 0.15, height * 0.18, width * 0.36);
      glowA.addColorStop(0, 'rgba(14, 165, 198, 0.26)');
      glowA.addColorStop(1, 'rgba(14, 165, 198, 0)');
      context.fillStyle = glowA;
      context.fillRect(0, 0, width, height);

      const glowB = context.createRadialGradient(width * 0.9, height * 0.86, 20, width * 0.9, height * 0.86, width * 0.34);
      glowB.addColorStop(0, 'rgba(255, 122, 24, 0.22)');
      glowB.addColorStop(1, 'rgba(255, 122, 24, 0)');
      context.fillStyle = glowB;
      context.fillRect(0, 0, width, height);
    }

    if (hasTemplateImage) {
      const overlayOpacity = Number(template.backgroundOverlayOpacity);
      if (!Number.isNaN(overlayOpacity) && overlayOpacity > 0) {
        context.fillStyle = `rgba(255, 255, 255, ${Math.min(0.65, overlayOpacity)})`;
        context.fillRect(0, 0, width, height);
      }
    }

    // Keep the rendered content minimal: only participant name over the background.
    const nameX = Number(layout.nameX) || (width / 2);
    const nameY = Number(layout.nameY) || (height / 2);
    const certIdX = Number(layout.certIdX) || (width - 90);
    const certIdY = Number(layout.certIdY) || (height - 36);

    context.textAlign = 'right';
    context.textBaseline = 'bottom';
    context.fillStyle = textStyles.meta || palette.text;
    context.font = textStyles.certIdFont || '600 28px "Poppins", "Segoe UI", sans-serif';
    context.fillText(participant.certificateId, certIdX, certIdY);

    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillStyle = textStyles.primary || palette.text;
    context.font = textStyles.nameFont || '400 84px "Brush Script MT", "Segoe Script", "Lucida Handwriting", cursive';
    context.fillText(participant.name, nameX, nameY);

    modalImage.src = canvas.toDataURL('image/png');
  };

  const applyParticipantResult = async (eventConfig, participant) => {
    const verificationLink = buildVerificationLink(eventConfig, participant.certificateId);

    resultFields.eventName.textContent = eventConfig.eventName;
    resultFields.eventDate.textContent = eventConfig.eventDate;
    resultFields.venue.textContent = participant.campus || state.selectedCampus || eventConfig.venue;
    resultFields.organizer.textContent = eventConfig.organizer;
    resultFields.participant.textContent = participant.name;
    resultFields.certType.textContent = eventConfig.certificateType;
    resultFields.certId.textContent = '';
    const certIdLink = document.createElement('a');
    certIdLink.href = verificationLink;
    certIdLink.target = '_blank';
    certIdLink.rel = 'noopener noreferrer';
    certIdLink.textContent = participant.certificateId;
    certIdLink.setAttribute('aria-label', `Verify certificate ${participant.certificateId}`);
    resultFields.certId.appendChild(certIdLink);
    resultFields.issueDate.textContent = participant.issueDate || eventConfig.issueDate;

    await drawCertificate(eventConfig, participant);
    resultsNode.hidden = false;
    setActionsEnabled(true);
    setStatus('Certificate generated. You can preview or download now.');
  };

  const selectParticipant = (participant) => {
    const eventConfig = state.eventConfigById.get(state.selectedEventId);

    if (!eventConfig) {
      return;
    }

    participantField.value = participant.name;
    state.selectedParticipant = participant;
    suggestionsNode.hidden = true;
    participantField.setAttribute('aria-expanded', 'false');
    setGenerateEnabled(true);
    setStatus('Participant selected. Click Generate Certificate.');
  };

  const renderSuggestions = (matches) => {
    state.activeSuggestions = matches.slice(0, MAX_SUGGESTIONS);
    state.activeSuggestionIndex = -1;

    if (!state.activeSuggestions.length) {
      suggestionsNode.hidden = true;
      participantField.setAttribute('aria-expanded', 'false');
      return;
    }

    suggestionsNode.innerHTML = state.activeSuggestions
      .map((entry, index) => (
        `<li role="option" id="participant-option-${index}" aria-selected="false">`
        + `<button type="button" data-suggestion-index="${index}">${entry.name}</button>`
        + '</li>'
      ))
      .join('');

    suggestionsNode.hidden = false;
    participantField.setAttribute('aria-expanded', 'true');
  };

  const applySuggestionHighlight = () => {
    const options = Array.from(suggestionsNode.querySelectorAll('[role="option"]'));
    options.forEach((option, index) => {
      const isActive = index === state.activeSuggestionIndex;
      option.classList.toggle('is-active', isActive);
      option.setAttribute('aria-selected', String(isActive));
      if (isActive) {
        participantField.setAttribute('aria-activedescendant', option.id);
      }
    });

    if (state.activeSuggestionIndex < 0) {
      participantField.removeAttribute('aria-activedescendant');
    }
  };

  const getCampusParticipantsPath = (eventConfig, campus) => {
    const campusMap = eventConfig && typeof eventConfig.participantsByCampus === 'object'
      ? eventConfig.participantsByCampus
      : null;

    if (campusMap && campus && typeof campusMap[campus] === 'string' && campusMap[campus].trim()) {
      return campusMap[campus].trim();
    }

    if (typeof eventConfig?.participantsPath === 'string' && eventConfig.participantsPath.trim()) {
      return eventConfig.participantsPath.trim();
    }

    return '';
  };

  const loadEventParticipants = async (eventId, campus) => {
    const eventConfig = state.eventConfigById.get(eventId);

    if (!eventConfig) {
      return;
    }

    const participantsPath = getCampusParticipantsPath(eventConfig, campus);

    if (!participantsPath) {
      throw new Error('No participants data path configured for selected campus');
    }

    setLoading(true, { showSkeleton: false });
    setStatus(`Loading participants for ${campus}...`);

    try {
      const payload = await fetchJson(participantsPath);
      const rows = Array.isArray(payload.participants) ? payload.participants : [];
      const hydrated = rows.map((participant, index) => {
        const certId = participant.certificateId || buildCertificateId(eventConfig, index);
        return {
          name: participant.name,
          campus: participant.campus || campus || '',
          certificateId: certId,
          issueDate: participant.issueDate || eventConfig.issueDate
        };
      });

      if (!state.participantsByEventCampus.has(eventId)) {
        state.participantsByEventCampus.set(eventId, new Map());
      }

      const campusStore = state.participantsByEventCampus.get(eventId);
      campusStore.set(campus || '__all__', hydrated);
      return hydrated;
    } finally {
      setLoading(false, { showSkeleton: false });
    }
  };

  const handleEventChange = async () => {
    const eventId = eventField.value;
    state.selectedEventId = eventId;
    state.selectedCampus = '';
    resetParticipantSelection({ clearInput: true });
    updateArchiveSelectionState();
    setCampusEnabled(false);

    if (!eventId) {
      setParticipantEnabled(false);
      setStatus('OpenBuild Week event is unavailable right now.');
      return;
    }

    const eventConfig = state.eventConfigById.get(eventId);
    if (!eventConfig) {
      setParticipantEnabled(false);
      setStatus('Selected event configuration is unavailable.');
      return;
    }

    const campuses = Array.isArray(eventConfig.campuses) ? eventConfig.campuses : [];
    campusField.innerHTML = '<option value="">Select campus / venue</option>';
    campuses.forEach((campus) => {
      const option = document.createElement('option');
      option.value = campus;
      option.textContent = campus;
      campusField.appendChild(option);
    });

    setCampusEnabled(true);

    setParticipantEnabled(false);
    setStatus('Select campus/venue, then start typing your name.');
  };

  const getParticipantsForActiveCampus = () => {
    if (!state.selectedCampus) {
      return [];
    }

    const campusStore = state.participantsByEventCampus.get(state.selectedEventId);
    if (!campusStore) {
      return [];
    }

    const participants = campusStore.get(state.selectedCampus) || campusStore.get('__all__') || [];

    const scoped = participants.filter((entry) => !entry.campus || entry.campus === state.selectedCampus);
    return scoped;
  };

  const handleCampusChange = async () => {
    state.selectedCampus = campusField.value;
    resetParticipantSelection({ clearInput: true });

    if (!state.selectedCampus) {
      setParticipantEnabled(false);
      setStatus('Select campus/venue, then start typing your name.');
      return;
    }

    const eventId = state.selectedEventId;
    const campus = state.selectedCampus;
    const campusStore = state.participantsByEventCampus.get(eventId);

    if (campusStore?.has(campus) || campusStore?.has('__all__')) {
      setParticipantEnabled(true);
      setStatus(`Campus selected: ${campus}. Start typing your name.`);
      participantField.focus();
      return;
    }

    try {
      const hydrated = await loadEventParticipants(eventId, campus);

      if (state.selectedEventId !== eventId || state.selectedCampus !== campus) {
        return;
      }

      setParticipantEnabled(true);
      setStatus(`Loaded ${hydrated.length} participants for ${campus}. Start typing your name.`);
      participantField.focus();
    } catch {
      if (state.selectedEventId !== eventId || state.selectedCampus !== campus) {
        return;
      }

      setParticipantEnabled(false);
      setStatus(`Unable to load participants for ${campus} right now.`);
      showToast({
        title: 'Participants Unavailable',
        message: 'Please try another campus, or refresh this page.',
        tone: 'error'
      });
    }
  };

  const enforceFixedObwEvent = () => {
    const fixedEventId = 'obw-2026';
    state.selectedEventId = fixedEventId;
    eventField.value = fixedEventId;
    eventField.disabled = true;
  };

  const buildArchiveCard = (eventConfig) => {
    const card = document.createElement('article');
    card.className = 'card certificates-event-card';
    const bannerImage = typeof eventConfig.archiveImage === 'string' ? eventConfig.archiveImage.trim() : '';
    const bannerImageMarkup = bannerImage
      ? `<img class="certificates-event-card__banner-image" src="${bannerImage}" alt="" loading="lazy" decoding="async" />`
      : '';
    card.innerHTML = `
      <div class="certificates-event-card__banner" aria-hidden="true">${bannerImageMarkup}</div>
      <div class="certificates-event-card__body">
        <h3>${eventConfig.eventName}</h3>
        <p class="certificates-event-card__meta">${eventConfig.eventDate}</p>
        <p class="certificates-event-card__count">${eventConfig.certificateCountLabel}</p>
        <button
          class="button button--secondary"
          type="button"
          aria-pressed="false"
          data-cert-archive-select
          data-event-id="${eventConfig.id}"
        >
          View Event
        </button>
      </div>
    `;
    return card;
  };

  const populateEvents = () => {
    eventField.innerHTML = '<option value="">Select event to load participants</option>';
    archiveNode.innerHTML = '';

    state.events.forEach((eventConfig) => {
      const option = document.createElement('option');
      option.value = eventConfig.id;
      option.textContent = eventConfig.eventName;
      eventField.appendChild(option);
      archiveNode.appendChild(buildArchiveCard(eventConfig));
    });

    archiveEmptyNode.hidden = state.events.length > 0;
  };

  const updateModalZoom = () => {
    modalImage.style.transform = `scale(${state.previewScale})`;
  };

  const downloadPdf = async () => {
    if (!state.selectedParticipant || !state.selectedEventId) {
      return;
    }

    try {
      const { jsPDF } = await import('jspdf');
      const orientation = canvas.width >= canvas.height ? 'landscape' : 'portrait';
      const pdf = new jsPDF({
        orientation,
        unit: 'px',
        format: [canvas.width, canvas.height]
      });

      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, canvas.width, canvas.height, undefined, 'FAST');
      pdf.save(`${slugifyName(state.selectedParticipant.name)}-${state.selectedEventId}.pdf`);
    } catch {
      showToast({
        title: 'PDF Export Failed',
        message: 'Please try again in a moment.',
        tone: 'error'
      });
    }
  };

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    if (!state.selectedEventId) {
      setStatus('Select an event first.');
      return;
    }

    const eventConfig = state.eventConfigById.get(state.selectedEventId);
    if (!eventConfig) {
      setStatus('Selected event configuration is unavailable.');
      return;
    }

    if (!state.selectedCampus) {
      setStatus('Select campus/venue first.');
      return;
    }

    let participant = state.selectedParticipant;

    if (!participant) {
      const typedName = participantField.value.trim().toLowerCase();
      const participants = getParticipantsForActiveCampus();
      participant = participants.find((entry) => entry.name.trim().toLowerCase() === typedName) || null;
    }

    if (!participant) {
      setStatus('Select a participant from suggestions, then generate the certificate.');
      return;
    }

    state.selectedParticipant = participant;
    setLoading(true, { showSkeleton: true });

    requestAnimationFrame(() => {
      requestAnimationFrame(async () => {
        await applyParticipantResult(eventConfig, participant);
        setLoading(false, { showSkeleton: false });
      });
    });
  });

  eventField.addEventListener('change', () => {
    handleEventChange();
  });

  campusField.addEventListener('change', () => {
    handleCampusChange();
  });

  participantField.addEventListener('input', () => {
    const query = participantField.value.trim().toLowerCase();
    state.selectedParticipant = null;
    resultsNode.hidden = true;
    setActionsEnabled(false);
    setGenerateEnabled(false);

    if (!state.selectedEventId) {
      return;
    }

    const participants = getParticipantsForActiveCampus();

    if (!query) {
      renderSuggestions([]);
      setStatus('Start typing your name to get suggestions.');
      return;
    }

    const matches = participants.filter((entry) => entry.name.toLowerCase().includes(query));
    renderSuggestions(matches);

    if (!matches.length) {
      setStatus('No matching participant names found for this event yet.');
      return;
    }

    setStatus(`${Math.min(matches.length, MAX_SUGGESTIONS)} suggestion${matches.length === 1 ? '' : 's'} available.`);
  });

  participantField.addEventListener('keydown', (event) => {
    if (suggestionsNode.hidden || !state.activeSuggestions.length) {
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      state.activeSuggestionIndex = (state.activeSuggestionIndex + 1) % state.activeSuggestions.length;
      applySuggestionHighlight();
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      state.activeSuggestionIndex = (state.activeSuggestionIndex - 1 + state.activeSuggestions.length) % state.activeSuggestions.length;
      applySuggestionHighlight();
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      const index = state.activeSuggestionIndex >= 0 ? state.activeSuggestionIndex : 0;
      const selected = state.activeSuggestions[index];
      if (selected) {
        selectParticipant(selected);
      }
      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      suggestionsNode.hidden = true;
      participantField.setAttribute('aria-expanded', 'false');
      participantField.removeAttribute('aria-activedescendant');
    }
  });

  suggestionsNode.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) {
      return;
    }

    const button = target.closest('[data-suggestion-index]');
    if (!button) {
      return;
    }

    const index = Number(button.getAttribute('data-suggestion-index'));
    const selected = state.activeSuggestions[index];
    if (selected) {
      selectParticipant(selected);
    }
  });

  document.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof Node)) {
      return;
    }

    if (!form.contains(target)) {
      suggestionsNode.hidden = true;
      participantField.setAttribute('aria-expanded', 'false');
      participantField.removeAttribute('aria-activedescendant');
    }
  });

  archiveNode.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) {
      return;
    }

    const button = target.closest('[data-cert-archive-select]');
    if (!button) {
      return;
    }

    const eventId = button.getAttribute('data-event-id');
    if (!eventId) {
      return;
    }

    if (eventId !== 'obw-2026') {
      showToast({
        title: 'OpenBuild Week Only',
        message: 'Certificate generation is currently available only for OpenBuild Week 2026.',
        tone: 'info'
      });
      return;
    }

    eventField.value = eventId;
    handleEventChange();
    campusField.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });

  actionPreview.addEventListener('click', () => {
    state.previewScale = 1;
    updateModalZoom();
  });

  zoomInButton.addEventListener('click', () => {
    state.previewScale = Math.min(2.6, Number((state.previewScale + 0.2).toFixed(2)));
    updateModalZoom();
  });

  zoomOutButton.addEventListener('click', () => {
    state.previewScale = Math.max(0.6, Number((state.previewScale - 0.2).toFixed(2)));
    updateModalZoom();
  });

  zoomResetButton.addEventListener('click', () => {
    state.previewScale = 1;
    updateModalZoom();
  });

  actionDownload.addEventListener('click', () => {
    downloadPdf();
  });

  const bootstrap = async () => {
    resultsNode.hidden = true;
    loadingNode.hidden = true;
    setCampusEnabled(false);
    setParticipantEnabled(false);
    setActionsEnabled(false);
    setGenerateEnabled(false);
    participantField.value = '';
    enforceFixedObwEvent();
    setStatus('Loading archived events...');

    try {
      const payload = await fetchJson(EVENTS_INDEX_PATH);
      const events = Array.isArray(payload.events) ? payload.events : [];

      state.events = events;
      events.forEach((eventConfig) => {
        state.eventConfigById.set(eventConfig.id, eventConfig);
      });

      populateEvents();
      if (!state.eventConfigById.has('obw-2026')) {
        setStatus('OpenBuild Week certificate event is not published yet.');
        return;
      }

      enforceFixedObwEvent();
      await handleEventChange();
    } catch {
      setStatus('Unable to load certificate events right now. Please refresh and try again.');
      showToast({
        title: 'Event Data Unavailable',
        message: 'Certificate archive could not be loaded.',
        tone: 'error'
      });
    }
  };

  form.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter') {
      return;
    }

    const target = event.target;
    if (!(target instanceof HTMLElement)) {
      return;
    }

    const pressedGenerate = target === generateButton;
    if (!pressedGenerate) {
      event.preventDefault();
    }
  });

  bootstrap();
};
