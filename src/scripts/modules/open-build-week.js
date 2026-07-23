const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

const format = (value) => String(Math.max(0, value)).padStart(2, '0');

const updateCountdownNode = (countdown, distance) => {
  const days = Math.floor(distance / DAY);
  const hours = Math.floor((distance % DAY) / HOUR);
  const minutes = Math.floor((distance % HOUR) / MINUTE);
  const eventLabel = countdown.dataset.eventLabel || 'OpenBuild Week event';

  const daysNode = countdown.querySelector('[data-obw-days]');
  const hoursNode = countdown.querySelector('[data-obw-hours]');
  const minutesNode = countdown.querySelector('[data-obw-minutes]');
  const statusNode = countdown.querySelector('[data-obw-countdown-status]');

  if (daysNode) daysNode.textContent = format(days);
  if (hoursNode) hoursNode.textContent = format(hours);
  if (minutesNode) minutesNode.textContent = format(minutes);

  if (statusNode) {
    statusNode.textContent = distance <= 0
      ? `${eventLabel} is live now. Registration is open.`
      : `Next ${eventLabel} starts in ${days} days, ${hours} hours, and ${minutes} minutes.`;
  }
};

export const initOpenBuildWeek = () => {
  const countdown = document.querySelector('[data-obw-countdown]');

  if (!countdown) {
    return;
  }

  const targetDate = countdown.getAttribute('data-target-date');
  const targetTime = targetDate ? Date.parse(targetDate) : Number.NaN;

  if (Number.isNaN(targetTime)) {
    return;
  }

  const tick = () => {
    const distance = targetTime - Date.now();
    updateCountdownNode(countdown, Math.max(0, distance));
  };

  tick();

  const intervalId = window.setInterval(() => {
    tick();

    if (targetTime <= Date.now()) {
      window.clearInterval(intervalId);
    }
  }, SECOND);
};
