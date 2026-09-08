(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const style = document.createElement('style');
  style.textContent = `
    .mtgx-spotlight{position:relative;overflow:hidden}
    .mtgx-spotlight:before{content:"";position:absolute;z-index:2;pointer-events:none;width:260px;height:260px;left:var(--spot-x,-130px);top:var(--spot-y,-130px);border-radius:50%;background:radial-gradient(circle,rgba(171,208,255,.17),rgba(94,132,255,.06) 30%,transparent 70%);transform:translate(-50%,-50%);opacity:0;transition:opacity .3s ease}
    .mtgx-spotlight:hover:before{opacity:1}
    .mtgx-image-reveal{clip-path:inset(0 0 100% 0);transform:scale(1.06);transition:clip-path 1.1s cubic-bezier(.22,1,.36,1),transform 1.2s cubic-bezier(.22,1,.36,1),filter .8s ease;filter:saturate(.72) brightness(.75)}
    .mtgx-image-reveal.mtgx-image-in{clip-path:inset(0);transform:scale(1);filter:saturate(.95) brightness(1)}
    .mtgx-section-index{position:absolute;right:clamp(18px,4vw,56px);top:clamp(24px,5vw,64px);font:600 9px ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.2em;color:rgba(185,207,255,.5);border:1px solid rgba(160,193,255,.2);padding:8px 10px;border-radius:999px;background:rgba(4,6,11,.42);backdrop-filter:blur(8px)}
    .mtgx-section-index i{display:inline-block;width:5px;height:5px;border-radius:50%;background:#9dc7ff;box-shadow:0 0 10px #8bbaff;margin-right:7px;vertical-align:1px}
    .mtgx-card-edge{position:absolute;pointer-events:none;inset:0;border-radius:inherit;border:1px solid transparent;background:linear-gradient(135deg,rgba(183,216,255,.38),transparent 30%,transparent 70%,rgba(139,113,255,.22)) border-box;mask:linear-gradient(#000 0 0) padding-box,linear-gradient(#000 0 0);mask-composite:exclude;opacity:0;transition:opacity .35s ease}
    .mtgx-spotlight:hover .mtgx-card-edge{opacity:1}
    @media(prefers-reduced-motion:reduce){.mtgx-image-reveal{clip-path:none;transform:none;filter:none}.mtgx-spotlight:before{display:none}}
  `;
  document.head.appendChild(style);
  const sectionWords=[['CATÁLOGO','01'],['PROCESSO','02'],['AVISOS','03'],['PORTFÓLIO','04'],['CONEXÃO','05'],['LABORATÓRIO','06']];
  const setup=()=>{
    document.querySelectorAll('.product-card,.notice-card,.portfolio-card,.channel-card,.hero-card,.quick-card').forEach(card=>{
      if(card.dataset.mtgxMicro)return;card.dataset.mtgxMicro='1';card.classList.add('mtgx-spotlight');const edge=document.createElement('i');edge.className='mtgx-card-edge';card.appendChild(edge);card.addEventListener('pointermove',e=>{const r=card.getBoundingClientRect();card.style.setProperty('--spot-x',`${e.clientX-r.left}px`);card.style.setProperty('--spot-y',`${e.clientY-r.top}px`)},{passive:true});
    });
    document.querySelectorAll('section').forEach(section=>{if(section.querySelector('.mtgx-section-index'))return;const text=(section.textContent||'').toUpperCase();const found=sectionWords.find(([word])=>text.includes(word));if(!found)return;const tag=document.createElement('span');tag.className='mtgx-section-index';tag.innerHTML='<i></i>'+found[1]+' / '+found[0];section.appendChild(tag)});
    document.querySelectorAll('.product-card img,.portfolio-card img,.hero-card img').forEach(img=>{if(img.dataset.mtgxImage)return;img.dataset.mtgxImage='1';img.classList.add('mtgx-image-reveal');if(reduce)img.classList.add('mtgx-image-in');else new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){img.classList.add('mtgx-image-in');e.target._mtgxObs?.disconnect()}}),{threshold:.15}).observe(img)});
  };
  setup();
  const observer=new MutationObserver(()=>setup());observer.observe(document.body,{childList:true,subtree:true});setTimeout(()=>observer.disconnect(),12000);
})();
