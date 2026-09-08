(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const css = document.createElement('style');
  css.textContent = `
    :root{--background:#050608!important;--foreground:#e7edf5!important;--card:#0a0d12!important;--popover:#090c11!important;--muted:#11161d!important;--border:rgba(183,204,226,.14)!important;--ring:#6d91b8!important}
    html,body{background:#050608!important;color:#e7edf5!important}
    body{background-image:radial-gradient(ellipse at 50% -15%,rgba(87,112,143,.13),transparent 48%),linear-gradient(180deg,#050608 0%,#080a0d 52%,#040506 100%)!important}
    body:before{content:"";position:fixed;inset:0;z-index:-2;pointer-events:none;opacity:.22;background-image:linear-gradient(rgba(255,255,255,.018) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.014) 1px,transparent 1px);background-size:42px 42px;mask-image:linear-gradient(to bottom,black,transparent 82%)}
    [class*="card" i],[class*="panel" i],[class*="modal" i],[class*="dialog" i]{border-color:rgba(184,208,235,.13)!important;box-shadow:0 18px 48px rgba(0,0,0,.34)!important}
    .mtgx-dark-vignette{position:fixed;inset:0;z-index:1000;pointer-events:none;background:radial-gradient(ellipse at center,transparent 40%,rgba(0,0,0,.25) 100%)}
    .mtgx-spotlight{position:fixed;z-index:999;pointer-events:none;width:320px;height:320px;border-radius:50%;transform:translate(-50%,-50%);background:radial-gradient(circle,rgba(161,205,255,.11),rgba(89,139,202,.035) 34%,transparent 70%);mix-blend-mode:screen;opacity:0;transition:opacity .25s ease}
    .mtgx-sheen{position:relative;overflow:hidden}.mtgx-sheen:after{content:"";position:absolute;inset:-80% -35%;pointer-events:none;background:linear-gradient(112deg,transparent 42%,rgba(214,235,255,.11) 49%,rgba(255,255,255,.035) 52%,transparent 60%);transform:translateX(-55%) rotate(8deg);opacity:0}.mtgx-sheen:hover:after{opacity:1;transform:translateX(55%) rotate(8deg);transition:transform .7s var(--mtgx-ease),opacity .25s ease}
    .mtgx-reveal{opacity:0;transform:translateY(16px);transition:opacity .42s var(--mtgx-ease),transform .42s var(--mtgx-ease)}.mtgx-reveal.is-visible{opacity:1;transform:none}
    .mtgx-ripple{position:absolute;pointer-events:none;border-radius:50%;background:rgba(220,241,255,.32);transform:scale(0);animation:mtgx-ripple .42s ease-out forwards}@keyframes mtgx-ripple{to{transform:scale(1);opacity:0}}
    .mtgx-focus-visible:focus-visible{outline:2px solid #9acbff!important;outline-offset:3px!important;box-shadow:0 0 0 5px rgba(117,174,236,.14)!important}
    .mtgx-tilt{transform:perspective(900px) rotateX(var(--mtgx-rx,0deg)) rotateY(var(--mtgx-ry,0deg)) translateZ(0);transition:transform .28s var(--mtgx-ease),box-shadow .28s var(--mtgx-ease)}.mtgx-tilt:hover{box-shadow:0 22px 50px rgba(0,0,0,.46)!important}
    :root{--mtgx-ease:cubic-bezier(.23,1,.32,1)}
    .mtgx-reading-progress{position:fixed;z-index:2200;top:0;left:0;width:100%;height:2px;pointer-events:none;background:linear-gradient(90deg,#79b8ff,#b7e7ff);transform-origin:left;transform:scaleX(0);box-shadow:0 0 10px rgba(121,184,255,.7)}
    .mtgx-top-button{position:fixed;z-index:1500;right:18px;bottom:18px;width:42px;height:42px;border:1px solid rgba(166,206,255,.25);border-radius:50%;background:rgba(8,12,20,.86);color:#dceeff;backdrop-filter:blur(12px);opacity:0;transform:translateY(10px);pointer-events:none;transition:opacity .18s var(--mtgx-ease),transform .18s var(--mtgx-ease);font:700 18px/1 system-ui;box-shadow:0 12px 30px rgba(0,0,0,.28)}
    .mtgx-top-button.is-visible{opacity:1;transform:none;pointer-events:auto}.mtgx-top-button:active{transform:scale(.94)}
    .mtgx-mobile-quick{display:none}
    @media(max-width:700px){html,body{width:100%;max-width:100%;overflow-x:hidden}body{padding-bottom:env(safe-area-inset-bottom)}.mtgx-mobile-quick{display:flex;position:fixed;z-index:1400;left:10px;right:10px;bottom:max(10px,env(safe-area-inset-bottom));gap:7px;padding:7px;border:1px solid rgba(157,201,255,.18);border-radius:16px;background:rgba(8,11,18,.92);backdrop-filter:blur(16px);box-shadow:0 14px 35px rgba(0,0,0,.45);transform:translateY(140%);transition:transform .24s var(--mtgx-ease)}.mtgx-mobile-quick.is-visible{transform:none}.mtgx-mobile-quick button{flex:1;min-height:44px;border:0;border-radius:11px;background:rgba(130,180,255,.13);color:#e4f2ff;font:800 10px system-ui;letter-spacing:.06em;-webkit-tap-highlight-color:transparent}.mtgx-mobile-quick button:first-child{background:linear-gradient(135deg,#79b8ff,#527bff);color:#07101e}.mtgx-top-button{bottom:78px;right:12px;width:40px;height:40px}.mtgx-ripple{animation-duration:.32s}section,.section-block,.process-section,.split-section{scroll-margin-top:68px}button,a,[role="button"]{min-height:44px}input,textarea,select{font-size:16px!important}.mtgx-sheen{transform:none!important}.mtgx-reveal{transform:translateY(10px)}[role="dialog"],.modal,.dialog,.sheet,.drawer{width:min(94vw,520px)!important;max-height:88svh!important;overflow:auto!important;border-radius:20px!important}}
    @media(prefers-reduced-motion:reduce){.mtgx-top-button,.mtgx-mobile-quick{transition:none}}
    @media(max-width:700px){.mtgx-spotlight{display:none}.mtgx-sheen:hover:after{display:none}}
  `;
  document.head.appendChild(css);
  const vignette = document.createElement('div'); vignette.className='mtgx-dark-vignette'; document.body.appendChild(vignette);
  const spotlight = document.createElement('div'); spotlight.className='mtgx-spotlight'; document.body.appendChild(spotlight);
  if (!reduced && innerWidth > 700) {
    let spotFrame = 0, sx = 0, sy = 0;
    addEventListener('pointermove', e => { sx=e.clientX; sy=e.clientY; spotlight.style.opacity='.75'; if(!spotFrame) spotFrame=requestAnimationFrame(()=>{spotFrame=0;spotlight.style.left=`${sx}px`;spotlight.style.top=`${sy}px`}); }, {passive:true});
    addEventListener('blur', () => { spotlight.style.opacity='0'; }, {passive:true});
  }
  const sheenTargets = () => document.querySelectorAll('.card,.product-card,[class*="product" i],[class*="portfolio" i]').forEach(el => el.classList.add('mtgx-sheen'));
  const revealTargets = () => document.querySelectorAll('section,.section-block,.process-section,.split-section').forEach(el => el.classList.add('mtgx-reveal'));
  const revealObserver = new IntersectionObserver(entries => entries.forEach(entry => { if(entry.isIntersecting) { entry.target.classList.add('is-visible'); revealObserver.unobserve(entry.target); } }), {threshold:.08});
  const observeReveals = () => document.querySelectorAll('.mtgx-reveal:not(.is-visible)').forEach(el => revealObserver.observe(el));
  const enhance = () => { sheenTargets(); revealTargets(); observeReveals(); };
  enhance();
  new MutationObserver(() => requestAnimationFrame(enhance)).observe(document.body,{childList:true,subtree:true});
  document.addEventListener('focusin', event => event.target.closest?.('button,a,input,textarea,select')?.classList.add('mtgx-focus-visible'), {passive:true});
  if (!reduced && innerWidth > 700) {
    document.addEventListener('pointermove', event => {
      const card=event.target.closest?.('.mtgx-sheen'); if(!card) return;
      const r=card.getBoundingClientRect(); const px=(event.clientX-r.left)/r.width-.5; const py=(event.clientY-r.top)/r.height-.5;
      card.classList.add('mtgx-tilt'); card.style.setProperty('--mtgx-rx',`${(-py*3).toFixed(2)}deg`); card.style.setProperty('--mtgx-ry',`${(px*4).toFixed(2)}deg`);
    }, {passive:true});
    document.addEventListener('pointerout', event => { const card=event.target.closest?.('.mtgx-sheen'); if(card && !card.contains(event.relatedTarget)){card.style.setProperty('--mtgx-rx','0deg');card.style.setProperty('--mtgx-ry','0deg');} }, {passive:true});
  }
  document.addEventListener('click', event => {
    if (reduced) return;
    const target = event.target.closest('button,a,[role="button"]'); if(!target) return;
    const rect=target.getBoundingClientRect(); const size=Math.max(rect.width,rect.height); const ripple=document.createElement('i');
    ripple.className='mtgx-ripple'; ripple.style.width=`${size}px`; ripple.style.height=`${size}px`; ripple.style.left=`${event.clientX-rect.left-size/2}px`; ripple.style.top=`${event.clientY-rect.top-size/2}px`;
    if(getComputedStyle(target).position==='static') target.style.position='relative'; target.appendChild(ripple); setTimeout(()=>ripple.remove(),500);
  }, {passive:true});
  const progress = document.createElement('div'); progress.className = 'mtgx-reading-progress'; document.body.appendChild(progress);
  const top = document.createElement('button'); top.className='mtgx-top-button'; top.type='button'; top.setAttribute('aria-label','Voltar ao topo'); top.textContent='↑'; document.body.appendChild(top);
  const quick = document.createElement('nav'); quick.className='mtgx-mobile-quick'; quick.setAttribute('aria-label','Ações rápidas');
  quick.innerHTML='<button type="button" data-action="catalog">VER PRODUTOS</button><button type="button" data-action="support">SUPORTE</button>';
  document.body.appendChild(quick);
  const catalog = () => document.getElementById('catalogo')?.scrollIntoView({behavior: reduced ? 'auto' : 'smooth', block:'start'});
  const support = () => {
    const match = [...document.querySelectorAll('button,a,[role="button"]')].find(el => /suporte|atendimento|falar com/i.test(el.textContent || el.getAttribute('aria-label') || ''));
    match?.click();
  };
  quick.addEventListener('click', e => { const action=e.target.closest('button')?.dataset.action; if(action==='catalog') catalog(); if(action==='support') support(); });
  top.addEventListener('click', () => scrollTo({top:0, behavior: reduced ? 'auto' : 'smooth'}));
  let scheduled=false;
  const update = () => { scheduled=false; const max=document.documentElement.scrollHeight-innerHeight; const y=max>0 ? scrollY/max : 0; progress.style.transform=`scaleX(${Math.min(1,Math.max(0,y))})`; const visible=scrollY>420; top.classList.toggle('is-visible',visible); quick.classList.toggle('is-visible',scrollY>180); };
  addEventListener('scroll', () => { if(!scheduled){scheduled=true; requestAnimationFrame(update)} }, {passive:true});
  addEventListener('resize', update, {passive:true}); update();
  // Add accessible labels to icon-only controls without changing React markup.
  const labelIcons = () => document.querySelectorAll('button:not([aria-label])').forEach(btn => { if(!btn.textContent.trim() && btn.querySelector('svg')) btn.setAttribute('aria-label','Ação'); });
  new MutationObserver(() => requestAnimationFrame(labelIcons)).observe(document.body,{childList:true,subtree:true}); labelIcons();
})();
