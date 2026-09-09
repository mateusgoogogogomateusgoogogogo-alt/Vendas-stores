(() => {
  if (location.pathname.startsWith('/admin')) return;
  const style = document.createElement('style');
  style.textContent = `.mtgx-portfolio-cta{display:inline-flex;align-items:center;gap:8px;margin-top:14px;min-height:42px;padding:0 14px;border:1px solid rgba(159,196,255,.34);border-radius:10px;background:linear-gradient(135deg,rgba(141,184,255,.18),rgba(80,112,180,.08));color:#d8e8ff;font-size:11px;font-weight:800;letter-spacing:.04em;text-decoration:none;transition:transform .18s ease,border-color .18s ease,background .18s ease}.mtgx-portfolio-cta:hover{transform:translateY(-2px);border-color:rgba(159,196,255,.68);background:rgba(141,184,255,.2)}.mtgx-profile-portfolio-note{margin:12px 0 0;padding:10px 12px;border-left:2px solid #8db8ff;border-radius:0 9px 9px 0;background:rgba(141,184,255,.08);color:#adc2df;font-size:11px;line-height:1.5}.mtgx-profile-portfolio-note a{color:#d7e8ff;font-weight:800}`;
  document.head.appendChild(style);
  const addPortfolioCta = () => {
    const section = document.querySelector('#portfolio');
    if (section && !section.querySelector('.mtgx-portfolio-cta')) {
      const link = document.createElement('a'); link.className = 'mtgx-portfolio-cta'; link.href = '#portfolio'; link.innerHTML = 'Ver portfólio completo <span aria-hidden="true">↗</span>'; const heading = section.querySelector('.section-heading'); (heading || section).appendChild(link);
    }
    const modal = document.querySelector('.mtgx-profile-modal');
    if (modal && !modal.querySelector('.mtgx-profile-portfolio-note')) {
      const body = modal.querySelector('.mtgx-profile-body'); if (!body) return;
      const note = document.createElement('p'); note.className = 'mtgx-profile-portfolio-note'; note.innerHTML = 'Gostou da loja? <a href="#portfolio">Acesse meu portfólio</a> para ver projetos e referências.'; note.querySelector('a').addEventListener('click', () => modal.classList.remove('open')); body.appendChild(note);
    }
  };
  const observer = new MutationObserver(() => requestAnimationFrame(addPortfolioCta));
  observer.observe(document.body, { childList: true, subtree: true });
  setTimeout(addPortfolioCta, 500);
})();
/* Public portfolio navigation and profile recommendation */
