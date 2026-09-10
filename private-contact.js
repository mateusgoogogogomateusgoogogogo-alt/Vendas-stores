(() => {
  if (location.pathname.startsWith('/admin')) return;
  const escapeHtml = value => String(value || '').replace(/[&<>"']/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#039;' }[char]));
  let settings = {};
  const style = document.createElement('style');
  style.textContent = `.mtgx-private-trigger{position:fixed;right:18px;bottom:18px;z-index:10000;border:1px solid rgba(255,255,255,.2);border-radius:999px;padding:13px 17px;background:#ed1b24;color:#fff;box-shadow:0 14px 35px rgba(0,0,0,.4);font:800 12px system-ui;cursor:pointer}.mtgx-private-trigger:hover{filter:brightness(1.1);transform:translateY(-2px)}.mtgx-private-backdrop{position:fixed;inset:0;z-index:10001;display:grid;place-items:center;padding:18px;background:rgba(0,0,0,.7);backdrop-filter:blur(8px)}.mtgx-private-modal{width:min(470px,100%);border:1px solid rgba(237,27,36,.42);border-radius:20px;padding:22px;background:linear-gradient(145deg,#271218,#0c0d12);box-shadow:0 25px 80px rgba(0,0,0,.55);color:#fff}.mtgx-private-modal__head{display:flex;justify-content:space-between;gap:12px;align-items:start}.mtgx-private-modal h2{margin:0;font-size:22px}.mtgx-private-modal p{margin:7px 0 18px;color:#bfc5d1;font-size:12px;line-height:1.5}.mtgx-private-close{border:0;background:transparent;color:#aeb4c2;font-size:20px;cursor:pointer}.mtgx-private-options{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:12px}.mtgx-private-options button{border:1px solid rgba(255,255,255,.14);border-radius:10px;padding:10px 7px;background:rgba(255,255,255,.05);color:#fff;font-size:11px;font-weight:750;cursor:pointer}.mtgx-private-options button.is-active{border-color:#ed1b24;background:rgba(237,27,36,.2)}.mtgx-private-message{width:100%;min-height:110px;box-sizing:border-box;resize:vertical;border:1px solid rgba(255,255,255,.14);border-radius:11px;padding:12px;background:rgba(0,0,0,.24);color:#fff;font:500 12px system-ui}.mtgx-private-channels{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:12px}.mtgx-private-channels a{border-radius:9px;padding:10px 6px;text-align:center;text-decoration:none;color:#fff;background:#ed1b24;font-size:11px;font-weight:850}.mtgx-private-channels a:nth-child(2){background:#2586c8}.mtgx-private-channels a:nth-child(3){background:#6d3aa7}.mtgx-private-note{margin-top:12px;color:#8f98a8;font-size:10px;text-align:center}@media(max-width:520px){.mtgx-private-trigger{right:10px;bottom:10px}.mtgx-private-options,.mtgx-private-channels{grid-template-columns:1fr}.mtgx-private-modal{padding:17px}}`;
  document.head.appendChild(style);

  const buildMessage = kind => ({
    compra: 'Olá! Quero negociar uma compra na MTGX Stores. Pode me passar detalhes, disponibilidade e condições?',
    divulgacao: 'Olá! Tenho interesse em negociar uma divulgação/parceria na MTGX Stores. Podemos conversar sobre formato, prazo e valores?',
    parceria: 'Olá! Quero apresentar uma proposta de parceria para a MTGX Stores. Podemos conversar no privado?'
  }[kind] || 'Olá! Quero falar com o ADM da MTGX Stores para negociar uma oportunidade.');
  const waLink = message => { const base = String(settings.whatsappUrl || ''); if (!base) return ''; return base + (base.includes('?') ? '&' : '?') + 'text=' + encodeURIComponent(message); };

  async function mount() {
    if (document.querySelector('.mtgx-private-trigger')) return;
    try { settings = ((await (await fetch('/api/store', { cache: 'no-store' })).json()) || {}).settings || {}; } catch { settings = {}; }
    const trigger = document.createElement('button'); trigger.className = 'mtgx-private-trigger'; trigger.type = 'button'; trigger.textContent = 'Falar no privado';
    document.body.appendChild(trigger);
    const backdrop = document.createElement('div'); backdrop.className = 'mtgx-private-backdrop'; backdrop.hidden = true;
    backdrop.innerHTML = `<div class="mtgx-private-modal" role="dialog" aria-modal="true" aria-labelledby="mtgx-private-title"><div class="mtgx-private-modal__head"><div><h2 id="mtgx-private-title">Vamos negociar?</h2><p>Escolha o assunto e mande uma mensagem pronta para o ADM. Atendimento direto para compras, divulgações e parcerias.</p></div><button class="mtgx-private-close" type="button" aria-label="Fechar">×</button></div><div class="mtgx-private-options"><button type="button" data-kind="compra" class="is-active">Compra</button><button type="button" data-kind="divulgacao">Divulgação</button><button type="button" data-kind="parceria">Parceria</button></div><textarea class="mtgx-private-message" aria-label="Mensagem para o ADM"></textarea><div class="mtgx-private-channels"><a data-channel="whatsapp" target="_blank" rel="noopener noreferrer">WhatsApp</a><a data-channel="telegram" target="_blank" rel="noopener noreferrer">Telegram</a><a data-channel="instagram" target="_blank" rel="noopener noreferrer">Instagram</a></div><div class="mtgx-private-note">A mensagem fica com você: revise antes de enviar.</div></div>`;
    document.body.appendChild(backdrop);
    const message = backdrop.querySelector('.mtgx-private-message');
    const refresh = kind => { message.value = buildMessage(kind); backdrop.querySelectorAll('[data-kind]').forEach(button => button.classList.toggle('is-active', button.dataset.kind === kind)); backdrop.querySelector('[data-channel="whatsapp"]').href = waLink(message.value) || '#'; backdrop.querySelector('[data-channel="telegram"]').href = settings.telegramUrl || '#'; backdrop.querySelector('[data-channel="instagram"]').href = settings.instagramUrl || '#'; };
    trigger.addEventListener('click', () => { backdrop.hidden = false; refresh('compra'); });
    const sponsoredHead = document.querySelector('.mtgx-sponsored-public__head');
    if (sponsoredHead) {
      const sponsoredCta = document.createElement('button');
      sponsoredCta.type = 'button'; sponsoredCta.textContent = 'Quero divulgar'; sponsoredCta.className = 'mtgx-private-trigger'; sponsoredCta.style.position = 'static'; sponsoredCta.style.padding = '8px 11px'; sponsoredCta.addEventListener('click', () => { backdrop.hidden = false; refresh('divulgacao'); });
      sponsoredHead.appendChild(sponsoredCta);
    }
    backdrop.querySelector('.mtgx-private-close').addEventListener('click', () => { backdrop.hidden = true; });
    backdrop.addEventListener('click', event => { if (event.target === backdrop) backdrop.hidden = true; });
    backdrop.querySelectorAll('[data-kind]').forEach(button => button.addEventListener('click', () => refresh(button.dataset.kind)));
    message.addEventListener('input', () => { backdrop.querySelector('[data-channel="whatsapp"]').href = waLink(message.value) || '#'; });
    refresh('compra');
  }
  window.addEventListener('load', mount, { once: true });
  setTimeout(mount, 1000);
})();
