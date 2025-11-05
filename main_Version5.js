/* ===================== Notifications (badge + toast) ===================== */
(function(){
  const bell = document.getElementById('notif-bell');
  const badge = document.getElementById('notif-badge');
  const toast = document.getElementById('toast');

  function setBadge(n){
    if(!badge) return;
    if(n<=0){ badge.hidden = true; badge.textContent = '0'; }
    else { badge.hidden = false; badge.textContent = String(n); }
  }

  let unread = 0;
  function pushToast(text){
    if(!toast) return;
    const div = document.createElement('div');
    div.className = 'item';
    div.textContent = text;
    toast.appendChild(div);
    setTimeout(()=>div.remove(), 3500);
    setBadge(++unread);
  }

  // 暴露到全局供其他模块调用
  window.__notify = {
    toast: pushToast,
    increase: (n=1)=> setBadge(unread+=n),
    clear: ()=>{ unread=0; setBadge(0); }
  };

  bell?.addEventListener('click', ()=> window.__notify?.clear());
})();

/* ===================== Report modal (reusable) ===================== */
(function(){
  const modal = document.getElementById('report-modal');
  const form = document.getElementById('report-form');
  const cancel = document.getElementById('report-cancel');
  const target = document.getElementById('report-target');
  if(!modal || !form) return;

  let reportCtx = { user: null, msgId: null };
  function open(ctx){ reportCtx = ctx||{}; modal.classList.add('open'); }
  function close(){ modal.classList.remove('open'); form.reset(); }

  window.__report = { open, close };

  form.addEventListener('submit', (e)=>{
    e.preventDefault();
    const fd = new FormData(form);
    const reason = String(fd.get('reason')||'').trim();
    const payload = { id: crypto.randomUUID?.() || String(Date.now()), reason, at: new Date().toISOString(), ...reportCtx };
    const list = JSON.parse(localStorage.getItem('reports')||'[]');
    list.push(payload);
    localStorage.setItem('reports', JSON.stringify(list));
    window.__notify?.toast('Report submitted. Thank you!');
    close();
  });
  cancel?.addEventListener('click', close);

  // 允许设置可见的“举报对象”文案
  if(target) {
    const backup = target.textContent;
    document.addEventListener('open-report', (e)=>{
      const { label } = e.detail || {};
      target.textContent = label || backup;
    });
  }
})();

/* ===================== Match page: filters + cards + report buttons ===================== */
(function(){
  const grid = document.getElementById('match-grid');
  const form = document.getElementById('match-filter');
  if(!grid || !form) return;

  const USERS = [
    { id:'u_luna', name:'Luna', age:22, gender:'Female', interests:['music','coffee'], about:'Coffee & lo-fi.' },
    { id:'u_milo', name:'Milo', age:25, gender:'Male', interests:['basketball'], about:'Weekend hooper.' },
    { id:'u_nabi', name:'Nabi', age:21, gender:'Female', interests:['reading'], about:'Bookworm.' },
    { id:'u_kuro', name:'Kuro', age:28, gender:'Male', interests:['gaming'], about:'RPG lover.' },
    { id:'u_sora', name:'Sora', age:24, gender:'Male', interests:['music'], about:'Guitar practice.' },
    { id:'u_mimi', name:'Mimi', age:26, gender:'Female', interests:['travel'], about:'Backpacker.' },
  ];

  function card(u){
    const tags = u.interests.map(t=>`<span class="tag">${t}</span>`).join(' ');
    return `
      <article class="card user-card" tabindex="0">
        <h3>${u.name}</h3>
        <p class="user-meta">Age ${u.age} · ${u.gender}</p>
        <p class="muted">Interests: ${u.interests.join(', ')}</p>
        <div class="row">
          <a class="btn primary" href="user.html?name=${encodeURIComponent(u.name)}">View</a>
          <button class="btn ghost report-btn" data-id="${u.id}" data-name="${u.name}">Report</button>
        </div>
      </article>
    `;
  }

  function render(list){
    grid.innerHTML = list.map(card).join('');
  }

  function apply(){
    const fd = new FormData(form);
    const gender = String(fd.get('gender')||'').toLowerCase();
    const min = Number(fd.get('min_age')||18);
    const max = Number(fd.get('max_age')||80);
    const interest = String(fd.get('interest')||'').toLowerCase().trim();

    const res = USERS.filter(u=>{
      const byG = gender? u.gender.toLowerCase()===gender : true;
      const byA = u.age>=min && u.age<=max;
      const byI = interest? u.interests.some(i=>i.toLowerCase().includes(interest)) : true;
      return byG && byA && byI;
    });
    render(res);
    window.__notify?.toast(`Found ${res.length} candidate(s).`);
  }

  render(USERS);
  form.addEventListener('submit', e=>{ e.preventDefault(); apply(); });
  form.addEventListener('reset', ()=> setTimeout(()=>{ render(USERS); window.__notify?.toast('Filters cleared.'); },0));

  grid.addEventListener('click', e=>{
    const btn = e.target.closest('.report-btn'); if(!btn) return;
    const name = btn.dataset.name;
    document.dispatchEvent(new CustomEvent('open-report',{ detail:{ label:`Reporting ${name}` }}));
    window.__report?.open({ user: btn.dataset.id });
  });
})();

/* ===================== Chat page: dialog + notifications + echo bot ===================== */
(function(){
  const log = document.getElementById('chat-log');
  const form = document.getElementById('chat-form');
  const input = document.getElementById('chat-input');
  const openReport = document.getElementById('open-report');
  const openHelp = document.getElementById('open-help');
  const aboutModal = document.getElementById('about-modal');
  const aboutClose = document.getElementById('about-close');
  if(!log || !form || !input) return;

  function add(text, who='you'){
    const li = document.createElement('li');
    li.textContent = (who==='bot'?'Meow: ':'You: ') + text;
    log.appendChild(li); log.scrollTop = log.scrollHeight;
  }

  form.addEventListener('submit', e=>{
    e.preventDefault();
    const text = input.value.trim(); if(!text) return;
    add(text,'you'); input.value='';
    // “收到消息”→ 通知
    setTimeout(()=>{
      add('Meow~ Got your message!', 'bot');
      window.__notify?.toast('New message received');
    }, 420);
  });

  // Report from chat
  openReport?.addEventListener('click', ()=>{
    document.dispatchEvent(new CustomEvent('open-report',{ detail:{ label:'Reporting this conversation' }}));
    window.__report?.open({ user:'unknown', msgId:null });
  });

  // About dialog
  function openAbout(){ aboutModal?.classList.add('open'); }
  function closeAbout(){ aboutModal?.classList.remove('open'); }
  openHelp?.addEventListener('click', openAbout);
  aboutClose?.addEventListener('click', closeAbout);
})();
