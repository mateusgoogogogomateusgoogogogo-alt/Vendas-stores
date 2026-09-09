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
    if (!grid || !active) return false;
    if (grid.querySelector('.product-card')) return true;
    if (grid.querySelector('.empty-state')) return false;
    active.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
    return false;
  };
  idle(optimize);
  let recoveryFrame = 0;
  const catalogObserver = new MutationObserver(() => {
    if (recoveryFrame) return;
    recoveryFrame = requestAnimationFrame(() => {
      recoveryFrame = 0;
      if (recoverCatalog()) catalogObserver.disconnect();
    });
  });
  catalogObserver.observe(document.body, { childList: true, subtree: true });
  setTimeout(() => {
    const grid = document.querySelector('.product-grid');
    const active = document.querySelector('.filters .filter.active, .category-tabs button.active');
    if (grid && active && !grid.querySelector('.product-card')) active.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
    if (recoverCatalog()) catalogObserver.disconnect();
  }, 1200);
})();
