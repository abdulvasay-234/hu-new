const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const IST_OFFSET = '+05:30';

const format = (value) => String(Math.max(0, value)).padStart(2, '0');

const DATE_PATTERN = /(\d{1,2}\s+[A-Za-z]{3}\s+\d{4})/;
const TIME_PATTERN = /(\d{1,2}:\d{2}\s*[AP]M)/i;

const formatEventDate = (eventDate) => {
  const day = format(eventDate.getDate());
  const month = eventDate.toLocaleString('en-US', { month: 'short' }).toUpperCase();
  const year = eventDate.getFullYear();
  return `${day} ${month} ${year}`;
};

const getCityFromEvent = (event) => {
  if (event.city) {
    return event.city;
  }

  if (/grand finale/i.test(event.campus)) {
    return 'TBD';
  }

  return 'Hyderabad';
};

const parseRoadmapEvent = (card) => {
  const metaText = card.querySelector('.obw-roadstop__meta')?.textContent || '';
  const dateText = card.getAttribute('data-obw-date') || card.querySelector('.obw-roadstop__date')?.textContent || '';
  const timeText = card.getAttribute('data-obw-time') || '';
  const campus = card.querySelector('h3')?.textContent?.trim() || '';
  const dateMatch = dateText.match(DATE_PATTERN) || metaText.match(DATE_PATTERN);

  if (!dateMatch || !campus) {
    return null;
  }

  const timeMatch = timeText.match(TIME_PATTERN) || metaText.match(TIME_PATTERN);
  const startTime = timeMatch ? timeMatch[1].replace(/\s+/g, ' ').trim().toUpperCase() : '09:30 AM';
  const timestamp = Date.parse(`${dateMatch[1]} ${startTime} GMT${IST_OFFSET}`);

  if (Number.isNaN(timestamp)) {
    return null;
  }

  return {
    timestamp,
    date: new Date(timestamp),
    campus,
    city: card.getAttribute('data-obw-city') || '',
    modalTarget: card.getAttribute('href') || ''
  };
};

const getRoadmapEvents = () => {
  const cards = Array.from(document.querySelectorAll('.obw-roadmap .obw-roadstop'));

  return cards
    .map(parseRoadmapEvent)
    .filter((event) => Boolean(event))
    .sort((left, right) => left.timestamp - right.timestamp);
};

const getNextEvent = (events, now) => {
  for (let index = 0; index < events.length; index += 1) {
    if (events[index].timestamp >= now) {
      return events[index];
    }
  }

  return null;
};

const syncNextStop = (countdown, event) => {
  const nextDateNode = countdown.querySelector('[data-obw-next-date]');
  const nextCampusNode = countdown.querySelector('[data-obw-next-campus]');
  const nextCityNode = countdown.querySelector('[data-obw-next-city]');
  const defaultCity = countdown.dataset.defaultCity || 'Hyderabad';
  const resolvedCity = event ? getCityFromEvent(event) || defaultCity : defaultCity;

  if (nextDateNode) {
    nextDateNode.textContent = event ? formatEventDate(event.date) : 'SCHEDULE TBD';
  }

  if (nextCampusNode) {
    nextCampusNode.textContent = event ? event.campus.toUpperCase() : 'NEXT CAMPUS STOP';
  }

  if (nextCityNode) {
    nextCityNode.textContent = resolvedCity.toUpperCase();
  }

  const registerLink = document.querySelector('[data-obw-register-link]');
  if (!registerLink || !event || !event.modalTarget.startsWith('#')) {
    return;
  }

  const modalId = event.modalTarget.slice(1);
  registerLink.setAttribute('href', event.modalTarget);
  registerLink.setAttribute('data-modal-open', event.modalTarget);
  registerLink.setAttribute('aria-controls', modalId);
};

const updateCountdownNode = (countdown, distance, hasUpcomingEvent) => {
  const days = Math.floor(distance / DAY);
  const hours = Math.floor((distance % DAY) / HOUR);
  const minutes = Math.floor((distance % HOUR) / MINUTE);

  const daysNode = countdown.querySelector('[data-obw-days]');
  const hoursNode = countdown.querySelector('[data-obw-hours]');
  const minutesNode = countdown.querySelector('[data-obw-minutes]');
  const statusNode = countdown.querySelector('[data-obw-countdown-status]');

  if (daysNode) daysNode.textContent = format(days);
  if (hoursNode) hoursNode.textContent = format(hours);
  if (minutesNode) minutesNode.textContent = format(minutes);

  if (statusNode) {
    if (!hasUpcomingEvent) {
      statusNode.textContent = 'Roadshow schedule update coming soon';
      return;
    }

    statusNode.textContent = distance <= 0 ? 'Campus stop is now live' : 'Next campus stop in';
  }
};

export const initOpenBuildWeek = () => {
  const countdown = document.querySelector('[data-obw-countdown]');

  if (!countdown) {
    return;
  }

  const events = getRoadmapEvents();
  if (!events.length) {
    return;
  }

  let activeEvent = getNextEvent(events, Date.now()) || events[events.length - 1];
  syncNextStop(countdown, activeEvent);

  const tick = () => {
    const now = Date.now();
    const nextEvent = getNextEvent(events, now);

    if (nextEvent && nextEvent.timestamp !== activeEvent.timestamp) {
      activeEvent = nextEvent;
      syncNextStop(countdown, activeEvent);
    }

    const distance = activeEvent.timestamp - now;
    const hasUpcomingEvent = Boolean(nextEvent);

    updateCountdownNode(countdown, Math.max(0, distance), hasUpcomingEvent);
  };


  tick();

  window.setInterval(tick, SECOND);
};
