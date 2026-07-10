export const setPageMetadata = ({ title, description, image, url } = {}) => {
	if (title) {
		document.title = title;
	}

	const metaDescription = document.querySelector('meta[name="description"]');
	if (description && metaDescription) {
		metaDescription.setAttribute('content', description);
	}

	const setMeta = (selector, content, attribute = 'content') => {
		if (!content) return;
		const element = document.querySelector(selector);
		if (element) element.setAttribute(attribute, content);
	};

	setMeta('meta[property="og:title"]', title);
	setMeta('meta[property="og:description"]', description);
	setMeta('meta[property="og:image"]', image);
	setMeta('meta[property="og:url"]', url);
	setMeta('meta[name="twitter:title"]', title);
	setMeta('meta[name="twitter:description"]', description);
	setMeta('meta[name="twitter:image"]', image);

	if (url) {
		const canonical = document.querySelector('link[rel="canonical"]');
		if (canonical) {
			canonical.setAttribute('href', url);
		}
	}
};
