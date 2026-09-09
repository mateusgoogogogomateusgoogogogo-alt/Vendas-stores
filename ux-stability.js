(() => {
  const style = document.createElement('style');
  style.textContent = `
    .hero,.hero-section,.hero-visual,.hero-card{background-color:#070a10}
    .hero img,.hero-visual img,.hero-card img{background:#0b1019}
    .mtgx-profile-modal,.mtgx-access-modal,.mtgx-bot-modal{padding-bottom:max(12px,env(safe-area-inset-bottom))}
    @media(max-width:700px){
      body{padding-bottom:max(108px,calc(92px + env(safe-area-inset-bottom)))!important}
      .mtgx-mobile-quick{bottom:calc(10px + env(safe-area-inset-bottom))!important}
      .mtgx-sales-live{bottom:calc(66px + env(safe-area-inset-bottom))!important;width:min(560px,calc(100% - 24px))!important}
      .mtgx-access-launcher{right:12px!important;bottom:calc(124px + env(safe-area-inset-bottom))!important;max-width:calc(100vw - 24px);white-space:nowrap}
      .mtgx-bot-launch{right:12px!important;bottom:calc(184px + env(safe-area-inset-bottom))!important}
      .mtgx-top-button{display:none!important}
      .hero-actions{margin-bottom:8px!important}
      .hero-actions .mtgx-secondary-action{display:none!important}
      .mtgx-profile-shell,.mtgx-access-dialog,.mtgx-bot-shell{padding-bottom:max(18px,env(safe-area-inset-bottom))!important}
      .mtgx-profile-body{padding-bottom:max(24px,calc(18px + env(safe-area-inset-bottom)))!important}
    }
    @media(prefers-reduced-motion:reduce){.mtgx-sales-live,.mtgx-access-launcher,.mtgx-bot-launch{transition:none!important}}
  `;
  document.head.appendChild(style);
  const preload = document.querySelector('link[rel="preload"][data-mtgx-hero]');
  if (!preload) { const link = document.createElement('link'); link.rel = 'preload'; link.as = 'image'; link.href = '/hero-background.jpg'; link.dataset.mtgxHero = '1'; document.head.appendChild(link); }
  const trimActions = () => {
    const heroActions = document.querySelector('.hero-actions');
    if (!heroActions || heroActions.dataset.mtgxTrimmed) return;
    heroActions.dataset.mtgxTrimmed = '1';
    const actions = [...heroActions.querySelectorAll('a,button')];
    actions.forEach((action, index) => { if (index > 1) action.classList.add('mtgx-secondary-action'); });
  };
  trimActions();
  new MutationObserver(trimActions).observe(document.body, { childList: true, subtree: true });
})();
/* MTGX Stores — visual stability and mobile safe-area pass */
