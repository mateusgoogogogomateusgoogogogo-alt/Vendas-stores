(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const icons = {
    catalog: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15.5A2.5 2.5 0 0 0 17.5 16H4z"/><path d="M4 5.5V19a2 2 0 0 0 2 2h11.5A2.5 2.5 0 0 0 20 18.5V18"/></svg>',
    notice: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/></svg>',
    process: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="5" r="2"/><circle cx="19" cy="12" r="2"/><path d="m7 11 3-4m4 0 3 4m-3 1-3 4m-4 0-3-3"/></svg>',
    portfolio: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8" cy="10" r="2"/><path d="m5 17 4-4 3 3 2-2 5 4"/></svg>',
    support: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 11a8 8 0 0 0-16 0v5a2 2 0 0 0 2 2h2v-6H5m14 0h-3v6h2a2 2 0 0 0 2-2z"/><path d="M9 20h5"/></svg>',
    verified: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 2 1.4 2.4-.2 1 2.2 2.1 1.2-.5 2.4.9 2.2-1.7 1.7-.2 2.4-2.4.5-1.6 1.8-2.2-.9-2.3.5-1.2-2.1-2.2-1-.2-2.4L4 11l.9-2.2-.5-2.4 2.1-1.2 1-2.2 2.4.2z"/><path d="m8.5 12 2.2 2.2 4.8-5"/></svg>',
    shield: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 20 6v5c0 5-3.4 8.2-8 10-4.6-1.8-8-5-8-10V6z"/><path d="m8.5 12 2.2 2.2 4.8-5"/></svg>',
    arrow: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h13m-6-6 6 6-6 6"/></svg>'
  };
  const css = document.createElement('style');
  css.textContent = `
    .mtgx-nav-icon,.mtgx-section-icon,.mtgx-trust-icon,.mtgx-card-icon{display:inline-flex;align-items:center;justify-content:center;flex:0 0 auto}
    .mtgx-nav-icon svg{width:13px;height:13px;stroke:currentColor;fill:none;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round;opacity:.72}
    .mtgx-section-icon{width:38px;height:38px;border:1px solid rgba(165,194,255,.28);border-radius:12px;background:linear-gradient(145deg,rgba(125,161,255,.14),rgba(255,255,255,.025));box-shadow:inset 0 1px rgba(255,255,255,.13),0 8px 22px rgba(0,0,0,.28)}
    .mtgx-section-icon svg{width:18px;height:18px;stroke:#c6dcff;fill:none;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round}
    .mtgx-trust-rail{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin:26px 0 0;padding:10px;border:1px solid rgba(178,202,255,.14);border-radius:16px;background:linear-gradient(120deg,rgba(255,255,255,.055),rgba(255,255,255,.012));backdrop-filter:blur(14px);box-shadow:inset 0 1px rgba(255,255,255,.12),0 16px 38px rgba(0,0,0,.2)}
    .mtgx-trust-item{display:flex;align-items:center;gap:10px;min-height:48px;padding:8px 10px;border-radius:11px;color:#b9c1cf;font-size:11px;letter-spacing:.04em}
    .mtgx-trust-item strong{display:block;color:#eef3ff;font-size:11px;font-weight:600}.mtgx-trust-item small{display:block;color:#7f899c;font-size:9px;margin-top:2px}
    .mtgx-trust-icon{width:30px;height:30px;border-radius:9px;color:#a8cbff;background:rgba(123,160,255,.1);border:1px solid rgba(154,190,255,.2)}.mtgx-trust-icon svg{width:16px;height:16px;stroke:currentColor;fill:none;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round}
    .mtgx-card-icon{width:28px;height:28px;margin-bottom:10px;color:#a9caff;border:1px solid rgba(164,194,255,.2);border-radius:8px;background:rgba(120,158,255,.09)}.mtgx-card-icon svg{width:15px;height:15px;stroke:currentColor;fill:none;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round}
    .mtgx-live-status{display:inline-flex;align-items:center;gap:7px;color:#b9e9cf;font-size:10px;letter-spacing:.12em;text-transform:uppercase}.mtgx-live-status:before{content:"";width:6px;height:6px;border-radius:50%;background:#76e6a2;box-shadow:0 0 0 4px rgba(118,230,162,.1),0 0 12px #76e6a2;animation:mtgx-status-pulse 2s ease-in-out infinite}
    @keyframes mtgx-status-pulse{50%{opacity:.45;transform:scale(.78)}}
    @media(max-width:700px){.mtgx-trust-rail{grid-template-columns:repeat(2,minmax(0,1fr));gap:6px}.mtgx-trust-item{padding:7px 6px}.mtgx-trust-item small{display:none}}
    @media(prefers-reduced-motion:reduce){.mtgx-live-status:before{animation:none}}
  `;
  document.head.appendChild(css);
  const addIcon = (el, key, cls) => { if (!el || el.querySelector(`.${cls}`)) return; const span=document.createElement('span'); span.className=cls; span.innerHTML=icons[key]||icons.arrow; el.prepend(span); };
  const enhance = () => {
    const links = Array.from(document.querySelectorAll('a,button'));
    links.forEach(el => { const text=(el.textContent||'').trim().toLowerCase(); if (text==='catálogo') addIcon(el,'catalog','mtgx-nav-icon'); else if(text==='avisos') addIcon(el,'notice','mtgx-nav-icon'); else if(text==='processo') addIcon(el,'process','mtgx-nav-icon'); else if(text==='portfólio') addIcon(el,'portfolio','mtgx-nav-icon'); else if(text==='suporte') addIcon(el,'support','mtgx-nav-icon'); });
    const sections = Array.from(document.querySelectorAll('section'));
    const map=[['catálogo','catalog'],['avisos','notice'],['processo','process'],['portfólio','portfolio'],['conexão','support']];
    sections.forEach(section=>{ if(section.querySelector('.mtgx-section-icon')) return; const t=(section.textContent||'').toLowerCase(); const item=map.find(([word])=>t.includes(word)); if(!item)return; const heading=section.querySelector('h2,h3'); if(heading) addIcon(heading,item[1],'mtgx-section-icon'); });
    document.querySelectorAll('.product-card,.notice-card,.portfolio-card,.channel-card').forEach((card,i)=>{if(!card.querySelector('.mtgx-card-icon')) addIcon(card,['catalog','shield','portfolio','support'][i%4],'mtgx-card-icon')});
    const hero=document.querySelector('.hero'); if(hero && !hero.querySelector('.mtgx-trust-rail')){const rail=document.createElement('div');rail.className='mtgx-trust-rail';rail.innerHTML=[['verified','Perfil verificado','Identidade confirmada'],['shield','Compra segura','Atendimento direto'],['arrow','Acesso rápido','Resposta pelo ADM'],['support','Suporte humano','Fale com a equipe']].map(([icon,title,sub])=>`<div class="mtgx-trust-item"><span class="mtgx-trust-icon">${icons[icon]}</span><span><strong>${title}</strong><small>${sub}</small></span></div>`).join('');const anchor=hero.querySelector('.hero-direct,.hero-proof,.hero-copy');(anchor||hero).appendChild(rail)}
  };
  enhance();
  const observer=new MutationObserver(()=>enhance()); observer.observe(document.body,{childList:true,subtree:true});
  setTimeout(()=>observer.disconnect(),12000);
})();
