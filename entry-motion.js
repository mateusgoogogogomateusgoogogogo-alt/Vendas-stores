(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const style = document.createElement('style');
  style.textContent = `
    .mtgx-reveal{transition:opacity .85s cubic-bezier(.22,1,.36,1),transform .85s cubic-bezier(.22,1,.36,1),filter .85s ease}
    .mtgx-reveal.mtgx-exit{opacity:.16;transform:translate3d(0,22px,0) scale(.985);filter:blur(1px)}
    .mtgx-motion-left{opacity:0;transform:translate3d(-44px,0,0) scale(.98)}
    .mtgx-motion-right{opacity:0;transform:translate3d(44px,0,0) scale(.98)}
    .mtgx-motion-up{opacity:0;transform:translate3d(0,38px,0) scale(.975)}
    .mtgx-motion-in{opacity:1;transform:translate3d(0,0,0) scale(1);filter:none}
    .mtgx-motion-line{position:absolute;pointer-events:none;left:0;top:0;width:1px;height:100%;background:linear-gradient(180deg,transparent,rgba(170,205,255,.65),transparent);opacity:0;transform:scaleY(.25);transform-origin:center;transition:opacity .7s ease,transform 1s cubic-bezier(.22,1,.36,1)}
    .mtgx-motion-in .mtgx-motion-line{opacity:.7;transform:scaleY(1)}
    @media(prefers-reduced-motion:reduce){.mtgx-reveal.mtgx-exit,.mtgx-motion-left,.mtgx-motion-right,.mtgx-motion-up{opacity:1;transform:none;filter:none}.mtgx-motion-line{display:none}}
  `;
  document.head.appendChild(style);
  const selector = '.hero-copy,.hero-aside,main > section,section > .section-heading,.product-card,.notice-card,.portfolio-card,.channel-card,.quick-card,.metric-card,.chart-card,.inbox-card,.list-card,.admin-section,.admin-topbar';
  const apply = () => {
    document.querySelectorAll(selector).forEach((el,i) => {
      if (!el.dataset.mtgxMotion) {
        el.dataset.mtgxMotion = '1';
        if (!el.classList.contains('mtgx-reveal')) el.classList.add('mtgx-motion-up');
        if (i % 5 === 1) el.classList.add('mtgx-motion-left');
        if (i % 5 === 3) el.classList.add('mtgx-motion-right');
        const line = document.createElement('i'); line.className='mtgx-motion-line'; el.appendChild(line);
      }
    });
  };
  apply();
  if (reduce || !('IntersectionObserver' in window)) return;
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    const el = entry.target;
    if (entry.isIntersecting) {
      el.classList.add('mtgx-motion-in');
      el.classList.remove('mtgx-exit');
    } else if (entry.boundingClientRect.top < innerHeight * .2 || entry.boundingClientRect.bottom > innerHeight * .8) {
      el.classList.add('mtgx-exit');
    }
  }), {threshold:[0,.12,.55], rootMargin:'-8% 0px -8% 0px'});
  document.querySelectorAll(selector).forEach(el => observer.observe(el));
  let scheduled = false;
  new MutationObserver(() => { if(scheduled)return; scheduled=true; requestAnimationFrame(()=>{scheduled=false;apply();document.querySelectorAll(selector).forEach(el=>observer.observe(el));}); }).observe(document.body,{childList:true,subtree:true});
})();
