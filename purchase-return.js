(() => {
  if (location.pathname.startsWith('/admin')) return;
  const pendingKey = 'mtgx-pending-purchase';
  const leftKey = 'mtgx-purchase-left';
  const read = () => { try { return JSON.parse(localStorage.getItem(pendingKey) || 'null'); } catch { return null; } };
  const save = value => localStorage.setItem(pendingKey, JSON.stringify({...value, savedAt: Date.now()}));
  const getModalProduct = modal => {
    const strong = modal?.querySelector('strong');
    const summary = [...(modal?.querySelectorAll('strong') || [])].find(el => /×/.test(el.textContent || ''));
    const qtyInput = [...(modal?.querySelectorAll('input') || [])].find(input => input.type === 'number');
    return { name: (summary?.textContent || strong?.textContent || 'Produto').replace(/^\d+\s*[×x]\s*/i, '').trim(), quantity: Math.max(1, Number(qtyInput?.value || 1)) };
  };
  const showReturnBadge = () => {
    const pending = read(); if (!pending) return;
    const cart = [...document.querySelectorAll('[aria-label="Abrir pedidos"],.header-cart')][0];
    if (cart) { cart.dataset.mtgxPending = '1'; cart.setAttribute('aria-label', `Abrir pedido pendente: ${pending.name}`); const count = cart.querySelector('b'); if (count) count.textContent = String(Math.max(1, Number(pending.quantity || 1))); }
    if (document.querySelector('.mtgx-purchase-return')) return;
    const box = document.createElement('aside'); box.className = 'mtgx-purchase-return'; box.innerHTML = `<strong>Pedido retomado · ${String(pending.quantity)} produto${pending.quantity > 1 ? 's' : ''}</strong><span>${pending.name}</span><button type="button">Inserir código de acesso</button>`; document.body.appendChild(box);
    box.querySelector('button').onclick = () => document.dispatchEvent(new CustomEvent('mtgx-open-access', { detail: pending }));
  };
  const capture = event => {
    const button = event.target.closest?.('button.modal-submit'); if (!button) return;
    const modal = button.closest('.modal-card,.overlay,[role="dialog"]'); const product = getModalProduct(modal); save(product); sessionStorage.setItem(leftKey, '1');
  };
  document.addEventListener('click', capture, {capture: true});
  const style = document.createElement('style'); style.textContent = `.mtgx-purchase-return{position:fixed;z-index:1700;left:50%;bottom:calc(92px + env(safe-area-inset-bottom));transform:translateX(-50%);display:grid;gap:4px;width:min(420px,calc(100% - 24px));padding:13px 15px;border:1px solid rgba(154,201,255,.3);border-radius:14px;background:rgba(7,12,22,.95);box-shadow:0 16px 40px rgba(0,0,0,.4);color:#eaf3ff}.mtgx-purchase-return strong{font-size:11px;letter-spacing:.06em;text-transform:uppercase}.mtgx-purchase-return span{font-size:13px;color:#a9bdd6;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.mtgx-purchase-return button{justify-self:start;margin-top:6px;padding:8px 10px;border:1px solid rgba(184,216,255,.3);border-radius:8px;background:#bcd8ff;color:#07101e;font-size:11px;font-weight:800}@media(max-width:700px){.mtgx-purchase-return{bottom:calc(126px + env(safe-area-inset-bottom))}}`; document.head.appendChild(style);
  const boot = () => { showReturnBadge(); if (sessionStorage.getItem(leftKey) === '1') { sessionStorage.removeItem(leftKey); setTimeout(() => document.dispatchEvent(new CustomEvent('mtgx-open-access', {detail: read()})), 700); } };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, {once: true}); else boot();
  addEventListener('pageshow', boot); addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && sessionStorage.getItem(leftKey) === '1') { sessionStorage.removeItem(leftKey); document.dispatchEvent(new CustomEvent('mtgx-open-access', {detail: read()})); } });
})();
