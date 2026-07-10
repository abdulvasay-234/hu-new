export const initGallery = () => {
  document.querySelectorAll('[data-gallery]').forEach((gallery) => {
    gallery.setAttribute('role', 'list');

    gallery.querySelectorAll('figure').forEach((item) => {
      item.setAttribute('data-hover', item.getAttribute('data-hover') ?? 'gallery');
    });
  });
};
