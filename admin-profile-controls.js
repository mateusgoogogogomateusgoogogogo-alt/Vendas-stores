(() => {
  const key = () => sessionStorage.getItem('orvex-admin-key') || '';
  const save = async values => {
    const response = await fetch('/api/trpc/admin.saveSettings?batch=1', {method:'POST', headers:{'content-type':'application/json','x-admin-key':key()}, body:JSON.stringify({'0':{json:values}})});
    if(!response.ok) throw new Error('Não foi possível salvar');
  };
  const add = () => {
    if(!key() || document.querySelector('.mtgx-profile-controls')) return;
    const anchor = [...document.querySelectorAll('label,div,p')].find(el => /Avatar \(URL\)/i.test(el.textContent||''));
    const host = anchor?.parentElement?.parentElement || document.querySelector('main'); if(!host) return;
    const box=document.createElement('section'); box.className='mtgx-profile-controls'; box.innerHTML='<h3>Perfil verificado e banner</h3><p>Personalize o perfil exibido na loja. GIFs e imagens podem ser URLs públicas ou arquivos hospedados na raiz.</p><label>Banner do perfil (URL)<input name="mtgx-profile-cover" placeholder="/1001256585.gif"></label><label>Nome exibido<input name="mtgx-verified-name" placeholder="Mtgz"></label><label>Usuário<input name="mtgx-profile-username" placeholder="@mtgxstores"></label><label>Bio<textarea name="mtgx-profile-bio" rows="3"></textarea></label><label>Localização<input name="mtgx-profile-location" placeholder="Brasil"></label><button type="button" name="mtgx-profile-save">Salvar perfil e banner</button><span class="mtgx-profile-status" role="status"></span>';
    const style=document.createElement('style'); style.textContent='.mtgx-profile-controls{margin:18px 0;padding:18px;border:1px solid rgba(155,198,240,.2);border-radius:16px;background:linear-gradient(145deg,rgba(21,27,36,.9),rgba(6,8,12,.94));color:#eaf3ff}.mtgx-profile-controls h3{margin:0 0 6px;font-size:16px}.mtgx-profile-controls p{color:#9fb0c5;font-size:12px;margin:0 0 14px}.mtgx-profile-controls label{display:grid;gap:6px;margin:10px 0;font-size:11px;font-weight:700}.mtgx-profile-controls input,.mtgx-profile-controls textarea{width:100%;padding:10px;border:1px solid rgba(155,198,240,.2);border-radius:9px;background:#080b10;color:#fff}.mtgx-profile-controls button{margin-top:8px;padding:11px 14px;border-radius:9px;background:#86c4ff;color:#06101d;font-weight:800}.mtgx-profile-status{display:block;margin-top:8px;font-size:11px;color:#9bd5ff}'; document.head.appendChild(style);
    host.appendChild(box);
    const field=(name,value)=>{box.querySelector(`[name="${name}"]`).value=value||''};
    fetch('/api/store').then(r=>r.json()).then(data=>{const s=data.settings||{};field('mtgx-profile-cover',s.profileCoverUrl);field('mtgx-verified-name',s.verifiedName);field('mtgx-profile-username',s.profileUsername);field('mtgx-profile-bio',s.profileBio);field('mtgx-profile-location',s.profileLocation)}).catch(()=>{});
    box.querySelector('[name="mtgx-profile-save"]').onclick=async()=>{const values={profileCoverUrl:box.querySelector('[name="mtgx-profile-cover"]').value.trim(),verifiedName:box.querySelector('[name="mtgx-verified-name"]').value.trim(),profileUsername:box.querySelector('[name="mtgx-profile-username"]').value.trim(),profileBio:box.querySelector('[name="mtgx-profile-bio"]').value.trim(),profileLocation:box.querySelector('[name="mtgx-profile-location"]').value.trim()};const status=box.querySelector('.mtgx-profile-status');try{await save(values);status.textContent='Perfil e banner salvos com sucesso.'}catch(error){status.textContent=error.message}};
  };
  const observe=()=>{add();}; setTimeout(observe,900); new MutationObserver(observe).observe(document.body,{childList:true,subtree:true});
})();
