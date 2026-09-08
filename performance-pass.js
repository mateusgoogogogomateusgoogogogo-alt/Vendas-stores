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
  idle(optimize);
})();
