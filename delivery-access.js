(() => {
  'use strict';
  if (!location.pathname.startsWith('/admin')) return;
  const key = () => sessionStorage.getItem('orvex-admin-key') || '';
  const request = async (url, options = {}) => { const response = await fetch(url, { ...options, headers: { 'content-type': 'application/json', 'x-admin-key': key(), ...(options.headers || {}) } }); if (!response.ok) throw new Error(`request-${response.status}`); return response.json(); };
  const catalogSection = () => [...document.querySelectorAll('.admin-section')].find((section) => /Produtos e estoque/i.test(section.innerText));
  const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[char]));
  let products = [];
  let codes = [];

  const render = () => {
    const target = catalogSection();
    if (!target || document.querySelector('.mtgx-delivery-panel')) return;
    const panel = document.createElement('section');
    panel.className = 'admin-section mtgx-delivery-panel';
    panel.innerHTML = `<div class="section-intro"><div><span class="admin-kicker">entrega / segurança</span><h2>Libere produtos pagos.</h2><p>Gere um código único depois de confirmar o pagamento. Cada código só libera um acesso.</p></div></div><div class="mtgx-delivery-grid"><div class="glass form-card mtgx-delivery-form"><div class="panel-title"><div><h3>Gerar código de entrega</h3><p class="mtgx-team-subtitle">Envie o código ao cliente somente depois da confirmação.</p></div><span class="mtgx-delivery-lock">✓</span></div><label class="admin-field"><span>Produto</span><select class="admin-select" data-delivery-product></select></label><label class="admin-field"><span>Link ou arquivo de entrega</span><input data-delivery-url placeholder="https://... ou /arquivo.zip" type="text"></label><label class="admin-field"><span>Observação para o cliente</span><textarea data-delivery-note placeholder="Ex.: acesso vitalício, instruções..." rows="3"></textarea></label><button class="admin-primary w-full" data-generate-code type="button">Gerar código único</button><div class="mtgx-generated-code" hidden><small>CÓDIGO PARA ENVIAR AO CLIENTE</small><strong data-generated-value></strong><button type="button" data-copy-code>Copiar código</button></div><p class="mtgx-delivery-status" role="status"></p></div><div class="glass list-card"><div class="panel-title"><div><h3>Códigos gerados</h3><p class="mtgx-team-subtitle">Disponíveis e já utilizados, com histórico.</p></div></div><div class="mtgx-code-list" data-code-list></div></div></div>`;
    target.after(panel);
    const productSelect = panel.querySelector('[data-delivery-product]');
    productSelect.innerHTML = products.length ? products.map((product) => `<option value="${product.id}">${escapeHtml(product.name)} — ${escapeHtml(product.price || '')}</option>`).join('') : '<option value="">Nenhum produto cadastrado</option>';
    const drawCodes = () => { panel.querySelector('[data-code-list]').innerHTML = codes.length ? codes.slice().reverse().map((code) => `<div class="mtgx-code-row"><span class="mtgx-code-status ${code.status}">${code.status === 'available' ? 'disponível' : 'usado'}</span><div><strong>${escapeHtml(code.productName)}</strong><small>${escapeHtml(code.codePreview || '•••••••')} · ${new Date(code.createdAt).toLocaleString('pt-BR')}</small></div></div>`).join('') : '<div class="mtgx-user-empty"><strong>Nenhum código gerado</strong><span>Os códigos aparecerão aqui depois da primeira confirmação de pagamento.</span></div>'; };
    drawCodes();
    panel.querySelector('[data-generate-code]').onclick = async () => { const button = panel.querySelector('[data-generate-code]'); const status = panel.querySelector('.mtgx-delivery-status'); const url = panel.querySelector('[data-delivery-url]').value.trim(); if (!productSelect.value || !url) { status.textContent = 'Escolha o produto e informe o link de entrega.'; return; } button.disabled = true; status.textContent = 'Gerando código seguro...'; try { const result = await request('/api/admin/access-codes', { method: 'POST', body: JSON.stringify({ productId: Number(productSelect.value), deliveryUrl: url, note: panel.querySelector('[data-delivery-note]').value.trim() }) }); panel.querySelector('.mtgx-generated-code').hidden = false; panel.querySelector('[data-generated-value]').textContent = result.code; panel.querySelector('[data-copy-code]').onclick = () => navigator.clipboard?.writeText(result.code); codes = [result, ...codes]; drawCodes(); status.textContent = 'Código criado. Envie ao cliente somente após confirmar o pagamento.'; button.disabled = false; } catch (_) { status.textContent = 'Não foi possível gerar o código agora.'; button.disabled = false; } };
  };
  const start = async () => { try { [products, codes] = await Promise.all([request('/api/products', { headers: {} }), request('/api/admin/access-codes')]); } catch (_) { products = []; codes = []; } render(); const observer = new MutationObserver(() => { if (!document.querySelector('.mtgx-delivery-panel')) render(); }); observer.observe(document.body, { childList: true, subtree: true }); };
  start();
})();
