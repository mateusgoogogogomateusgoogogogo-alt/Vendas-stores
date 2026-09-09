(() => {
  'use strict';

  const defaults = {
    profileGalaxyEnabled: true,
    profileGalaxyIntensity: 4,
    profileGalaxyColor: '#8db8ff',
    profileGalaxyParticles: true,
    profileGalaxySpeed: 18
  };
  let settings = { ...defaults };
  let injected = false;

  const css = document.createElement('style');
  css.textContent = `
    .mtgx-profile-modal{--profile-galaxy-color:#8db8ff;--profile-galaxy-speed:18s;overflow:auto!important;height:100dvh!important;min-height:100dvh!important;max-height:100dvh!important}
    .mtgx-profile-modal.open{background:radial-gradient(circle at 50% 38%,rgba(64,91,190,.2),rgba(1,3,10,.9) 62%),rgba(0,0,0,.84)}
    .mtgx-profile-shell{isolation:isolate;overflow:hidden!important;border-color:color-mix(in srgb,var(--profile-galaxy-color),white 28%)!important;box-shadow:0 30px 100px rgba(0,0,0,.8),0 0 70px color-mix(in srgb,var(--profile-galaxy-color),transparent 72%),inset 0 1px rgba(255,255,255,.2)!important}
    .mtgx-profile-galaxy{position:absolute;z-index:0;inset:0;overflow:hidden;pointer-events:none;opacity:0;transform:scale(1.08);transition:opacity .55s ease,transform 1.1s cubic-bezier(.2,.8,.2,1);background:radial-gradient(ellipse at 50% 20%,color-mix(in srgb,var(--profile-galaxy-color),transparent 74%),transparent 43%),radial-gradient(ellipse at 15% 58%,rgba(183,117,255,.18),transparent 33%),radial-gradient(ellipse at 90% 82%,rgba(31,190,255,.15),transparent 34%)}
    .mtgx-profile-modal.open .mtgx-profile-galaxy{opacity:1;transform:scale(1)}
    .mtgx-profile-galaxy:before,.mtgx-profile-galaxy:after{content:"";position:absolute;left:50%;top:26%;width:145%;height:36%;border:1px solid color-mix(in srgb,var(--profile-galaxy-color),transparent 55%);border-radius:50%;transform:translate(-50%,-50%) rotate(-18deg);box-shadow:0 0 25px color-mix(in srgb,var(--profile-galaxy-color),transparent 64%),inset 0 0 22px color-mix(in srgb,var(--profile-galaxy-color),transparent 76%);opacity:.7;animation:mtgx-galaxy-orbit var(--profile-galaxy-speed) linear infinite}
    .mtgx-profile-galaxy:after{width:118%;height:25%;top:30%;transform:translate(-50%,-50%) rotate(24deg);opacity:.42;animation-duration:calc(var(--profile-galaxy-speed) * 1.35);animation-direction:reverse}
    .mtgx-profile-galaxy-star{position:absolute;width:var(--star-size,2px);height:var(--star-size,2px);left:var(--star-x);top:var(--star-y);border-radius:50%;background:#fff;box-shadow:0 0 8px 2px color-mix(in srgb,var(--profile-galaxy-color),white 25%);opacity:var(--star-opacity,.75);animation:mtgx-star-twinkle var(--star-speed,3s) ease-in-out infinite alternate;animation-delay:var(--star-delay,0s)}
    .mtgx-profile-galaxy-core{position:absolute;left:50%;top:26%;width:56%;height:24%;border-radius:50%;transform:translate(-50%,-50%) rotate(-18deg);background:radial-gradient(ellipse,rgba(239,247,255,.65),color-mix(in srgb,var(--profile-galaxy-color),transparent 62%) 25%,transparent 70%);filter:blur(12px);opacity:.6;animation:mtgx-core-pulse 5s ease-in-out infinite alternate}
    .mtgx-profile-galaxy-particles{position:absolute;inset:0;opacity:.6;background-image:radial-gradient(circle at 18% 24%,rgba(255,255,255,.9) 0 1px,transparent 1.6px),radial-gradient(circle at 74% 16%,rgba(141,184,255,.9) 0 1px,transparent 1.7px),radial-gradient(circle at 84% 68%,rgba(224,173,255,.8) 0 1px,transparent 1.5px),radial-gradient(circle at 28% 82%,rgba(102,224,255,.8) 0 1px,transparent 1.4px);background-size:140px 120px,190px 170px,230px 180px,170px 150px;animation:mtgx-particle-drift 22s linear infinite}
    .mtgx-profile-shell>*:not(.mtgx-profile-galaxy):not(.mtgx-profile-close){position:relative;z-index:1}
    .mtgx-profile-shell>.mtgx-profile-close{position:absolute!important;z-index:4!important}
    .mtgx-profile-modal[data-galaxy="off"] .mtgx-profile-galaxy{display:none}
    .mtgx-profile-modal[data-particles="off"] .mtgx-profile-galaxy-particles{display:none}
    .mtgx-profile-modal[data-intensity="1"] .mtgx-profile-galaxy-star:nth-child(n+19),.mtgx-profile-modal[data-intensity="2"] .mtgx-profile-galaxy-star:nth-child(n+31),.mtgx-profile-modal[data-intensity="3"] .mtgx-profile-galaxy-star:nth-child(n+43),.mtgx-profile-modal[data-intensity="4"] .mtgx-profile-galaxy-star:nth-child(n+59){display:none}
    .mtgx-galaxy-settings{position:relative;margin-top:14px;padding:20px;border:1px solid rgba(159,193,255,.2);border-radius:16px;background:linear-gradient(145deg,rgba(29,39,69,.78),rgba(7,10,18,.92));box-shadow:inset 0 1px rgba(255,255,255,.09),0 16px 36px rgba(0,0,0,.2);overflow:hidden}
    .mtgx-galaxy-settings:before{content:"";position:absolute;inset:-45% 30% auto -15%;height:170px;background:radial-gradient(ellipse,rgba(120,160,255,.24),transparent 68%);pointer-events:none;filter:blur(10px)}
    .mtgx-galaxy-settings>*{position:relative}
    .mtgx-galaxy-settings-head{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;margin-bottom:16px}.mtgx-galaxy-settings-head h3{margin:0 0 5px;font:400 24px Georgia,serif;color:#f0f5ff}.mtgx-galaxy-settings-head p{margin:0;color:#9eabc0;font-size:11px;line-height:1.5}.mtgx-galaxy-pill{padding:7px 9px;border:1px solid rgba(170,205,255,.25);border-radius:999px;color:#a8caff;font:600 9px ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.1em;text-transform:uppercase;white-space:nowrap}
    .mtgx-galaxy-fields{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.mtgx-galaxy-field{display:grid;gap:7px;color:#b9c7dc;font-size:11px}.mtgx-galaxy-field small{color:#748197;font-size:10px;line-height:1.4}.mtgx-galaxy-field input[type=range]{accent-color:#9fc4ff;width:100%}.mtgx-galaxy-field input[type=color]{width:100%;height:38px;padding:4px;border:1px solid rgba(181,207,255,.2);border-radius:8px;background:#0a0e19}.mtgx-galaxy-toggle{display:flex;align-items:center;gap:9px;min-height:38px;padding:0 10px;border:1px solid rgba(181,207,255,.14);border-radius:9px;background:rgba(116,153,255,.06);color:#dce9ff;font-size:11px}.mtgx-galaxy-toggle input{accent-color:#9fc4ff}.mtgx-galaxy-save{margin-top:14px;min-height:42px;padding:10px 15px;border:1px solid rgba(192,218,255,.4);border-radius:9px;background:linear-gradient(135deg,#d8e8ff,#8db8ff);color:#0a1020;font-weight:800;cursor:pointer}.mtgx-galaxy-status{margin-left:10px;color:#8df1b5;font-size:11px}
    @keyframes mtgx-galaxy-orbit{to{transform:translate(-50%,-50%) rotate(342deg)}}@keyframes mtgx-star-twinkle{from{transform:scale(.55);opacity:.25}to{transform:scale(1.45);opacity:1}}@keyframes mtgx-core-pulse{from{opacity:.35;transform:translate(-50%,-50%) rotate(-18deg) scale(.92)}to{opacity:.8;transform:translate(-50%,-50%) rotate(-18deg) scale(1.08)}}@keyframes mtgx-particle-drift{to{background-position:30px -22px,-24px 28px,18px -30px,-32px 16px}}
    @media(max-width:700px){.mtgx-profile-galaxy{opacity:.8}.mtgx-profile-cover-meta{left:14px;right:58px;font-size:7px}.mtgx-galaxy-fields{grid-template-columns:1fr}.mtgx-galaxy-settings{padding:16px}.mtgx-galaxy-settings-head{display:block}.mtgx-galaxy-pill{display:inline-block;margin-top:10px}.mtgx-galaxy-status{display:block;margin:10px 0 0}}
    @media(prefers-reduced-motion:reduce){.mtgx-profile-galaxy:before,.mtgx-profile-galaxy:after,.mtgx-profile-galaxy-star,.mtgx-profile-galaxy-core,.mtgx-profile-galaxy-particles{animation:none!important}.mtgx-profile-galaxy{transition:none}}
  `;
  document.head.appendChild(css);

  const getStoreSettings = async () => {
    try {
      const response = await fetch('/api/store', { cache: 'no-store' });
      const data = await response.json();
      settings = { ...defaults, ...(data.settings || {}) };
    } catch (_) {
      settings = { ...defaults };
    }
    return settings;
  };

  const stars = () => Array.from({ length: 70 }, (_, i) => {
    const x = (i * 47 + 11) % 100;
    const y = (i * 71 + 7) % 100;
    const size = (i % 5 === 0 ? 2.8 : i % 3 === 0 ? 1.8 : 1.1).toFixed(1);
    const opacity = (0.32 + ((i * 13) % 60) / 100).toFixed(2);
    const speed = (2.2 + (i % 7) * .55).toFixed(2);
    const delay = (-((i % 9) * .7)).toFixed(2);
    return `<i class="mtgx-profile-galaxy-star" style="--star-x:${x}%;--star-y:${y}%;--star-size:${size}px;--star-opacity:${opacity};--star-speed:${speed}s;--star-delay:${delay}s"></i>`;
  }).join('');

  const applyVisualSettings = (modal) => {
    const enabled = settings.profileGalaxyEnabled !== false;
    const intensity = Math.max(1, Math.min(5, Number(settings.profileGalaxyIntensity) || 4));
    const color = /^#[0-9a-f]{6}$/i.test(String(settings.profileGalaxyColor)) ? settings.profileGalaxyColor : defaults.profileGalaxyColor;
    const speed = Math.max(8, Math.min(40, Number(settings.profileGalaxySpeed) || 18));
    modal.dataset.galaxy = enabled ? 'on' : 'off';
    modal.dataset.particles = settings.profileGalaxyParticles === false ? 'off' : 'on';
    modal.dataset.intensity = String(intensity);
    modal.style.setProperty('--profile-galaxy-color', color);
    modal.style.setProperty('--profile-galaxy-speed', `${speed}s`);
  };

  const ensureGalaxy = () => {
    const modal = document.querySelector('.mtgx-profile-modal');
    const shell = modal?.querySelector('.mtgx-profile-shell');
    if (!modal || !shell) return;
    applyVisualSettings(modal);
    if (shell.querySelector('.mtgx-profile-galaxy')) return;
    const galaxy = document.createElement('div');
    galaxy.className = 'mtgx-profile-galaxy';
    galaxy.setAttribute('aria-hidden', 'true');
    galaxy.innerHTML = `<div class="mtgx-profile-galaxy-core"></div><div class="mtgx-profile-galaxy-particles"></div>${stars()}`;
    shell.prepend(galaxy);
  };

  const renderAdminSettings = () => {
    if (!location.pathname.startsWith('/admin')) return;
    const main = document.querySelector('.admin-main');
    const existing = document.querySelector('.mtgx-galaxy-settings');
    const text = main?.innerText || '';
    if (!main || !text.includes('Loja e perfil')) {
      existing?.remove();
      return;
    }
    if (existing) return;
    const settingsGrid = main.querySelector('.settings-grid');
    if (!settingsGrid) return;
    const panel = document.createElement('section');
    panel.className = 'mtgx-galaxy-settings';
    panel.innerHTML = `<div class="mtgx-galaxy-settings-head"><div><h3>Perfil galáctico</h3><p>Escolha como o perfil aparece quando alguém abre sua identidade verificada.</p></div><span class="mtgx-galaxy-pill">nitro mood</span></div><div class="mtgx-galaxy-fields"><label class="mtgx-galaxy-field"><span>Ativar experiência</span><span class="mtgx-galaxy-toggle"><input data-galaxy-enabled type="checkbox"> Abrir com galáxia e brilho</span></label><label class="mtgx-galaxy-field"><span>Partículas flutuantes</span><span class="mtgx-galaxy-toggle"><input data-galaxy-particles type="checkbox"> Estrelas em movimento</span></label><label class="mtgx-galaxy-field"><span>Intensidade <output data-galaxy-intensity-value></output></span><input data-galaxy-intensity type="range" min="1" max="5" step="1"><small>Quantidade de estrelas e força do núcleo.</small></label><label class="mtgx-galaxy-field"><span>Velocidade <output data-galaxy-speed-value></output>s</span><input data-galaxy-speed type="range" min="8" max="40" step="1"><small>Menor valor deixa o movimento mais rápido.</small></label><label class="mtgx-galaxy-field"><span>Cor principal</span><input data-galaxy-color type="color"><small>Usada no brilho, órbita e borda do perfil.</small></label></div><button class="mtgx-galaxy-save" type="button">Salvar efeitos do perfil</button><span class="mtgx-galaxy-status" role="status"></span>`;
    settingsGrid.after(panel);
    const enabled = panel.querySelector('[data-galaxy-enabled]');
    const particles = panel.querySelector('[data-galaxy-particles]');
    const intensity = panel.querySelector('[data-galaxy-intensity]');
    const intensityValue = panel.querySelector('[data-galaxy-intensity-value]');
    const speed = panel.querySelector('[data-galaxy-speed]');
    const speedValue = panel.querySelector('[data-galaxy-speed-value]');
    const color = panel.querySelector('[data-galaxy-color]');
    const sync = () => { enabled.checked = settings.profileGalaxyEnabled !== false; particles.checked = settings.profileGalaxyParticles !== false; intensity.value = settings.profileGalaxyIntensity; intensityValue.textContent = `${intensity.value}/5`; speed.value = settings.profileGalaxySpeed; speedValue.textContent = speed.value; color.value = settings.profileGalaxyColor; };
    intensity.oninput = () => { intensityValue.textContent = `${intensity.value}/5`; };
    speed.oninput = () => { speedValue.textContent = speed.value; };
    sync();
    panel.querySelector('.mtgx-galaxy-save').onclick = async () => {
      const key = sessionStorage.getItem('orvex-admin-key');
      const status = panel.querySelector('.mtgx-galaxy-status');
      const payload = { profileGalaxyEnabled: enabled.checked, profileGalaxyParticles: particles.checked, profileGalaxyIntensity: Number(intensity.value), profileGalaxySpeed: Number(speed.value), profileGalaxyColor: color.value };
      try {
        const response = await fetch('/api/admin/settings', { method: 'PATCH', headers: { 'content-type': 'application/json', 'x-admin-key': key || '' }, body: JSON.stringify(payload) });
        if (!response.ok) throw new Error('save');
        settings = { ...settings, ...payload };
        status.textContent = 'Efeitos salvos.';
        document.dispatchEvent(new CustomEvent('mtgx-profile-settings-updated'));
      } catch (_) {
        status.textContent = 'Não foi possível salvar agora.';
      }
      setTimeout(() => { status.textContent = ''; }, 3500);
    };
  };

  const start = async () => {
    await getStoreSettings();
    ensureGalaxy();
    renderAdminSettings();
    let pending = false;
    const observer = new MutationObserver(() => {
      if (pending) return;
      pending = true;
      requestAnimationFrame(() => { pending = false; ensureGalaxy(); renderAdminSettings(); });
    });
    observer.observe(document.body, { childList: true, subtree: true });
    document.addEventListener('mtgx-profile-settings-updated', () => { applyVisualSettings(document.querySelector('.mtgx-profile-modal')); });
  };

  start();
})();
