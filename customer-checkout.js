(() => {
  const css=document.createElement('style');
  css.textContent='.mtgx-account-backdrop{position:fixed;inset:0;z-index:2300;display:grid;place-items:center;padding:18px;background:rgba(0,0,0,.78);backdrop-filter:blur(14px)}.mtgx-account-card{width:min(390px,100%);padding:22px;border:1px solid rgba(166,210,255,.24);border-radius:18px;background:#080b10;color:#e9f4ff;box-shadow:0 25px 80px rgba(0,0,0,.68)}.mtgx-account-card h3{margin:0 0 7px}.mtgx-account-card p{color:#9eb1c7;font-size:12px;line-height:1.5}.mtgx-account-card label{display:grid;gap:6px;margin:12px 0;font-size:11px;font-weight:700}.mtgx-account-card input{padding:11px;border:1px solid #294056;border-radius:9px;background:#0d121a;color:#fff;font-size:16px}.mtgx-account-card button{width:100%;padding:12px;border:0;border-radius:10px;background:#86c5ff;color:#06101d;font-weight:800}.mtgx-account-card small{display:block;margin-top:10px;color:#7790a8;font-size:10px}';
  document.head.appendChild(css);
  const getAccount=()=>{try{return JSON.parse(localStorage.getItem('mtgx-customer-account')||'null')}catch{return null}};
  const createAccount=(button)=>{
    if(document.querySelector('.mtgx-account-backdrop')) return;
    const back=document.createElement('div'); back.className='mtgx-account-backdrop';
    back.innerHTML='<form class="mtgx-account-card"><h3>Crie seu perfil de cliente</h3><p>É rápido e serve para salvar seu interesse, acompanhar o atendimento e facilitar suas próximas compras.</p><label>Seu nome<input name="name" required autocomplete="name" placeholder="Como podemos te chamar?"></label><label>Seu WhatsApp ou contato<input name="contact" required autocomplete="tel" placeholder="(00) 00000-0000"></label><button>Criar conta e continuar</button><small>Seus dados ficam no banco da loja e são usados apenas para atendimento e pedidos.</small></form>';
    document.body.appendChild(back);
    back.querySelector('form').onsubmit=async event=>{
      event.preventDefault();
      const data=Object.fromEntries(new FormData(event.currentTarget));
      const submit=event.currentTarget.querySelector('button'); submit.disabled=true; submit.textContent='Criando perfil...';
      try {
        const response=await fetch('/api/customers',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({...data,source:'checkout'})});
        if(!response.ok) throw Error('Não foi possível criar o perfil');
        const account=await response.json(); localStorage.setItem('mtgx-customer-account',JSON.stringify(account));
        const checkout=button.closest('[role="dialog"],.modal,.dialog,.sheet')||document; const inputs=[...checkout.querySelectorAll('input')];
        const name=inputs.find(input=>/nome/i.test(input.placeholder||input.name||''))||inputs[0]; const contact=inputs.find(input=>/contato|whats|telefone/i.test(input.placeholder||input.name||''))||inputs[1];
        if(name){name.value=data.name;name.dispatchEvent(new Event('input',{bubbles:true}))} if(contact){contact.value=data.contact;contact.dispatchEvent(new Event('input',{bubbles:true}))}
        back.remove(); setTimeout(()=>button.click(),60);
      } catch(error) {
        submit.disabled=false; submit.textContent='Criar conta e continuar'; const note=document.createElement('small'); note.textContent=error.message; note.style.color='#ff9b9b'; event.currentTarget.appendChild(note);
      }
    };
    back.addEventListener('click',event=>{if(event.target===back) back.remove()});
  };
  document.addEventListener('click',event=>{const button=event.target.closest?.('button.modal-submit');if(!button||getAccount())return;event.preventDefault();event.stopImmediatePropagation();createAccount(button)},{capture:true});
})();
