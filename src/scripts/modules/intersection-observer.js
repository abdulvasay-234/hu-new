export const createObserver = (callback, options = {}) => {
  if (!('IntersectionObserver' in window)) return null;
  return new IntersectionObserver(callback, options);
};
