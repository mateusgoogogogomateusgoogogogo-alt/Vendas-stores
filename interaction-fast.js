(() => {
  const words=/adicionar ao pedido|solicitar estoque|falar com suporte|abrir suporte|pedido|whatsapp/i;
  const mark=()=>{document.body.classList.add('mtgx-interaction-now');clearTimeout(window.__mtgxFastTimer);window.__mtgxFastTimer=setTimeout(()=>document.body.classList.remove('mtgx-interaction-now'),900)};
  document.addEventListener('pointerdown',e=>{const el=e.target.closest?.('button,a,[role="button"]');if(el&&words.test((el.textContent||'').trim()))mark()},{capture:true,passive:true});
  const observe=()=>document.querySelectorAll('.modal-backdrop,.dialog-overlay,[role="dialog"],.modal,.dialog,.sheet,.drawer,.cart-drawer,.support-modal').forEach(el=>el.classList.add('mtgx-fast-layer'));
  new MutationObserver(observe).observe(document.body,{childList:true,subtree:true});observe();
})();
