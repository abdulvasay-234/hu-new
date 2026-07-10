export const trackEvent = (eventName, payload = {}) => {
	window.dispatchEvent(new CustomEvent('hackunion:analytics', {
		detail: {
			eventName,
			payload
		}
	}));

	if (window.dataLayer && Array.isArray(window.dataLayer)) {
		window.dataLayer.push({ event: eventName, ...payload });
	}
};
