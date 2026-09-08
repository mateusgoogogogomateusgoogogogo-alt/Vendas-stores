(() => {
  const css = document.createElement('style');
  css.textContent = '.mtgx-cart-feedback{position:fixed;z-index:1600;left:50%;top:76px;transform:translate(-50%,-10px);padding:10px 14px;border:1px solid rgba(171,204,255,.25);border-radius:10px;background:rgba(7,10,17,.92);color:#dbe9ff;font:600 11px ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.08em;box-shadow:0 12px 30px rgba(0,0,0,.35);opacity:0;pointer-events:none;transition:opacity .18s ease,transform .18s ease}.mtgx-cart-feedback.open{opacity:1;transform:translate(-50%,0)}';
  document.head.appendChild(css);
  let feedback;
  const show = () => {
    feedback ??= (() => { const el = document.createElement('div'); el.className = 'mtgx-cart-feedback'; document.body.appendChild(el); return el; })();
    feedback.textContent = 'CATÁLOGO PRONTO';
    feedback.classList.add('open');
    clearTimeout(feedback._timer);
    feedback._timer = setTimeout(() => feedback.classList.remove('open'), 1000);
  };
  // Passive notification only: never preventDefault/stopPropagation on React controls.
  document.addEventListener('click', (event) => {
    const el = event.target.closest?.('.header-cart,[aria-label="Abrir pedidos"]');
    if (el) show();
  }, { passive: true });
})();
