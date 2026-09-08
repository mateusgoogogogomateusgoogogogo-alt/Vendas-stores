(() => {
  'use strict';
  if (!location.pathname.startsWith('/admin')) return;

  let directory = [];
  let admins = [];
  let selected = '';
  const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[char]));

  const key = () => sessionStorage.getItem('orvex-admin-key') || '';
  const request = async (url, options = {}) => {
    const response = await fetch(url, { ...options, headers: { 'content-type': 'application/json', 'x-admin-key': key(), ...(options.headers || {}) } });
    if (!response.ok) throw new Error(`request-${response.status}`);
    return response.json();
  };
  const teamSection = () => [...document.querySelectorAll('.admin-section')].find((section) => section.innerText.includes('Administradores autorizados.'));

  const render = () => {
    const section = teamSection();
    const card = section?.querySelector('.form-card');
    if (!card) return;
    const intro = section.querySelector('.section-intro p');
    if (intro) intro.textContent = 'Selecione usuários que já interagiram com a loja e distribua a operação com poucos cliques.';
    card.classList.add('mtgx-team-picker-card');
    card.innerHTML = `<div class="panel-title"><div><h3>Selecionar usuário</h3><p class="mtgx-team-subtitle">Escolha alguém que já entrou em contato com a loja.</p></div><span class="mtgx-team-icon">◉</span></div><label class="mtgx-team-search"><span>Buscar usuário</span><input type="search" placeholder="Nome, contato ou tipo..." autocomplete="off"></label><div class="mtgx-user-options" role="listbox" aria-label="Usuários disponíveis"></div><button class="admin-primary w-full mtgx-promote-selected" type="button" disabled>Promover usuário selecionado</button><p class="mtgx-team-status" role="status"></p>`;
    const search = card.querySelector('input');
    const options = card.querySelector('.mtgx-user-options');
    const promote = card.querySelector('.mtgx-promote-selected');
    const status = card.querySelector('.mtgx-team-status');
    const draw = () => {
      const term = search.value.trim().toLowerCase();
      const visible = directory.filter((user) => `${user.name} ${user.email} ${user.source}`.toLowerCase().includes(term));
      options.innerHTML = visible.length ? visible.map((user) => `<button type="button" class="mtgx-user-option${selected === user.openId ? ' is-selected' : ''}" data-open-id="${encodeURIComponent(user.openId)}" role="option" aria-selected="${selected === user.openId}"><span class="mtgx-user-avatar">${escapeHtml(String(user.name || 'U').slice(0, 1).toUpperCase())}</span><span class="mtgx-user-main"><strong>${escapeHtml(user.name || 'Usuário')}</strong><small>${escapeHtml(user.email || user.openId.replace(/^contact:/, ''))}</small></span><span class="mtgx-user-source">${user.isAdmin ? 'ADM atual' : escapeHtml(user.source)}</span></button>`).join('') : `<div class="mtgx-user-empty"><strong>Nenhum usuário encontrado</strong><span>Quando alguém abrir um ticket, enviar uma sugestão ou demonstrar interesse, aparecerá aqui para seleção.</span></div>`;
      promote.disabled = !selected;
      options.querySelectorAll('.mtgx-user-option').forEach((button) => { button.onclick = () => { selected = decodeURIComponent(button.dataset.openId); draw(); }; });
    };
    search.oninput = draw;
    promote.onclick = async () => {
      if (!selected) return;
      promote.disabled = true;
      status.textContent = 'Salvando membro...';
      try {
        await request('/api/admin/admins', { method: 'POST', body: JSON.stringify({ openId: selected }) });
        status.textContent = 'Administrador adicionado com sucesso.';
        admins = await request('/api/admin/admins');
        directory = directory.map((user) => user.openId === selected ? { ...user, isAdmin: true } : user);
        selected = '';
        draw();
      } catch (_) {
        status.textContent = 'Não foi possível salvar agora.';
        promote.disabled = false;
      }
    };
    draw();
  };

  const start = async () => {
    try {
      [directory, admins] = await Promise.all([request('/api/admin/user-directory'), request('/api/admin/admins')]);
    } catch (_) {
      directory = [];
      admins = [];
    }
    render();
    const observer = new MutationObserver(() => { if (!document.querySelector('.mtgx-team-picker-card')) render(); });
    observer.observe(document.body, { childList: true, subtree: true });
  };
  start();
})();
