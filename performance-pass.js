(() => {
  'use strict';
  const idle = window.requestIdleCallback || ((callback) => setTimeout(callback, 80));
  const optimize = () => {
    document.querySelectorAll('img').forEach((image) => {
      image.decoding = 'async';
      if (!image.closest('.hero') && !image.closest('.hero-card')) image.loading = 'lazy';
    });
    document.querySelectorAll('main > section, .catalog-section, .portfolio-section, .process-section, .channels-section').forEach((section, index) => {
      if (index > 0 && !section.classList.contains('hero')) section.classList.add('mtgx-defer-paint');
    });
    if (navigator.connection?.saveData) document.documentElement.classList.add('mtgx-save-data');
  };
  const recoverCatalog = () => {
    const grid = document.querySelector('.product-grid');
    const active = document.querySelector('.filters .filter.active, .category-tabs button.active');
    if (!grid || !active || grid.querySelector('.product-card,.empty-state')) return;
    active.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
  };
  idle(optimize);
  let recoveryFrame = 0;
  const catalogObserver = new MutationObserver(() => {
    if (recoveryFrame) return;
    recoveryFrame = requestAnimationFrame(() => {
      recoveryFrame = 0;
      recoverCatalog();
    });
  });
  catalogObserver.observe(document.body, { childList: true, subtree: true });
  setTimeout(recoverCatalog, 900);
})();
