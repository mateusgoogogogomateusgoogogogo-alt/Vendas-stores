(() => {
  if (location.pathname.startsWith('/admin')) return;
  const escapeHtml = value => String(value || '').replace(/[&<>"']/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#039;' }[char]));
  const mount = async () => {
    if (document.querySelector('.mtgx-sponsored-public')) return;
    try {
      const response = await fetch('/api/announcements', { cache: 'no-store' });
      const items = await response.json();
      const active = (items || []).filter(item => item.kind === 'sponsored' && item.active !== false && item.published !== false);
      if (!active.length) return;
      const root = document.querySelector('#root');
      if (!root) return;
      const section = document.createElement('section');
      section.className = 'mtgx-sponsored-public';
      section.setAttribute('aria-label', 'Parceiros da loja');
      section.innerHTML = `<div class="mtgx-sponsored-public__head"><span>PARCEIRO DA COMUNIDADE</span><strong>Conheça quem apoia a loja</strong></div><div class="mtgx-sponsored-public__grid">${active.map(item => `<article class="mtgx-sponsored-public__item"><img src="${escapeHtml(item.imageUrl || '/hero-background.jpg')}" alt="${escapeHtml(item.sponsor || item.title)}"><div><small>${escapeHtml(item.sponsor || 'Anunciante')}</small><h3>${escapeHtml(item.title || 'Oferta especial')}</h3><p>${escapeHtml(item.description || '')}</p><a href="${escapeHtml(item.linkUrl || '#')}" target="_blank" rel="noopener noreferrer">${escapeHtml(item.buttonLabel || 'Conhecer agora')} ↗</a></div></article>`).join('')}</div>`;
      const catalog = root.querySelector('.catalog, .product-grid, [class*="catalog"]');
      if (catalog && catalog.parentElement) catalog.parentElement.insertBefore(section, catalog);
      else root.appendChild(section);
    } catch {}
  };
  const style = document.createElement('style');
  style.textContent = `.mtgx-sponsored-public{width:min(1180px,calc(100% - 32px));margin:24px auto;padding:20px;border:1px solid rgba(237,27,36,.3);border-radius:20px;background:linear-gradient(135deg,rgba(48,16,22,.8),rgba(12,12,16,.94));box-shadow:0 16px 42px rgba(0,0,0,.24)}.mtgx-sponsored-public__head{display:flex;gap:10px;align-items:baseline;justify-content:space-between;margin-bottom:14px}.mtgx-sponsored-public__head span{color:#ff6068;font:700 10px ui-monospace,monospace;letter-spacing:.15em}.mtgx-sponsored-public__head strong{color:#f5f5f5;font-size:14px}.mtgx-sponsored-public__grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:12px}.mtgx-sponsored-public__item{display:grid;grid-template-columns:92px 1fr;gap:12px;align-items:center;padding:10px;border:1px solid rgba(255,255,255,.1);border-radius:14px;background:rgba(0,0,0,.22)}.mtgx-sponsored-public__item img{width:92px;height:92px;object-fit:cover;border-radius:10px}.mtgx-sponsored-public__item small{color:#ff8b90;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.08em}.mtgx-sponsored-public__item h3{margin:4px 0;color:#fff;font-size:15px}.mtgx-sponsored-public__item p{margin:0 0 9px;color:#bac0cc;font-size:11px;line-height:1.45}.mtgx-sponsored-public__item a{display:inline-block;color:#fff;background:#ed1b24;border-radius:8px;padding:7px 10px;font-size:11px;font-weight:800;text-decoration:none}@media(max-width:600px){.mtgx-sponsored-public{width:calc(100% - 20px);padding:14px}.mtgx-sponsored-public__head{display:block}.mtgx-sponsored-public__head strong{display:block;margin-top:6px}.mtgx-sponsored-public__item{grid-template-columns:70px 1fr}.mtgx-sponsored-public__item img{width:70px;height:70px}}`;
  document.head.appendChild(style);
  window.addEventListener('load', mount, { once: true });
  setTimeout(mount, 900);
})();
