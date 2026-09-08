(() => {
  'use strict';

  const applyGifBanner = (url) => {
    if (!url || !/\.gif(?:[?#].*)?$/i.test(url)) return;
    const hero = document.querySelector('.hero');
    if (!hero) return;
    const safeUrl = url.replace(/"/g, '%22');
    hero.style.backgroundImage = `linear-gradient(90deg, rgba(2,2,2,.93) 0%, rgba(2,2,2,.78) 43%, rgba(2,2,2,.48) 74%, rgba(2,2,2,.68) 100%), url("${safeUrl}")`;
    hero.style.backgroundPosition = 'center';
    hero.style.backgroundSize = 'cover';
    hero.dataset.mtgxGifBanner = 'active';
  };

  const start = async () => {
    try {
      const response = await fetch('/api/store', { cache: 'no-store' });
      const data = await response.json();
      const settings = data.settings || {};
      let url = settings.backgroundUrl || '';
      try {
        const slides = JSON.parse(settings.heroSlides || '[]');
        url = slides.find((item) => /\.gif(?:[?#].*)?$/i.test(String(item))) || url;
      } catch (_) {}
      applyGifBanner(url);
      const observer = new MutationObserver(() => applyGifBanner(url));
      observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['style', 'class'] });
    } catch (_) {}
  };

  start();
})();
