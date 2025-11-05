/* ================== Theme toggle / Nav active / Year ================== */
(function(){
  const root = document.documentElement, btn=document.getElementById('theme-toggle');
  const saved=localStorage.getItem('theme'); if(saved==='dark') root.classList.add('dark');
  if(btn){ btn.setAttribute('aria-pressed', root.classList.contains('dark'));
    btn.addEventListener('click',()=>{root.classList.toggle('dark');const d=root.classList.contains('dark');localStorage.setItem('theme',d?'dark':'light');btn.setAttribute('aria-pressed',d);});
  }
})();
(function(){
  const t=document.querySelector('.nav-toggle'), l=document.getElementById('nav-list'); if(!t||!l) return;
  t.addEventListener('click',()=>{const o=l.classList.toggle('open');t.setAttribute('aria-expanded',String(o));});
  l.addEventListener('click',e=>{ if(e.target.closest('a')){ l.classList.remove('open'); t.setAttribute('aria-expanded','false'); }});
})();
(function(){
  const l=document.getElementById('nav-list'); if(!l) return;
  const f=(location.pathname.split('/').pop()||'index.html').toLowerCase();
  l.querySelectorAll('a').forEach(a=>{const h=(a.getAttribute('href')||'').toLowerCase(); const on=(h===f)|| (f==='index.html'&&h.endsWith('index.html')); a.classList.toggle('active',on); a.setAttribute('aria-current',on?'page':'false');});
})();
document.getElementById('year')?.append(new Date().getFullYear());

/* ================== Demo data ================== */
const DEMO_USERS = [
  { id:'u_luna', name:'Luna', age:22, gender:'Female', interests:['music','coffee'], about:'Coffee & lo-fi beats.' },
  { id:'u_milo', name:'Milo', age:25, gender:'Male', interests:['basketball'], about:'Weekend hooper.' },
  { id:'u_nabi', name:'Nabi', age:21, gender:'Female', interests:['reading'], about:'Bookworm.' },
  { id:'u_kuro', name:'Kuro', age:28, gender:'Male', interests:['gaming'], about:'RPG lover.' },
  { id:'u_sora', name:'Sora', age:24, gender:'Male', interests:['music'], about:'Guitar practice.' },
  { id:'u_mimi', name:'Mimi', age:26, gender:'Female', interests:['travel'], about:'Backpacker.' },
];

/* Helpers */
function save(k,v){ localStorage.setItem(k, JSON.stringify(v)); }
function load(k, fallback=null){ try{ const v = localStorage.getItem(k); return v? JSON.parse(v): fallback; }catch(_){ return fallback; } }

/* ================== Notifications (badge + toast) ================== */
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

  window.__notify = { toast: pushToast, increase: (n=1)=> setBadge(unread+=n), clear: ()=>{ unread=0; setBadge(0); } };
  bell?.addEventListener('click', ()=> window.__notify?.clear());
})();

/* ================== Report modal (reusable) ================== */
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

  if(target) {
    const backup = target.textContent;
    document.addEventListener('open-report', (e)=>{
      const { label } = e.detail || {};
      target.textContent = label || backup;
    });
  }
})();

/* ================== Users page rendering ================== */
(function(){
  const list = document.getElementById('user-list');
  if(!list) return;
  function card(u){
    return `
      <article class="card user-card">
        <h3>${u.name}</h3>
        <p class="user-meta">Age ${u.age} · ${u.gender}</p>
        <p class="muted">Interests: ${u.interests.map(t=>`<span class="tag">${t}</span>`).join(' ')}</p>
        <div class="row">
          <a class="btn primary" href="user.html?name=${encodeURIComponent(u.name)}">View</a>
          <a class="btn ghost" href="chat.html">Chat</a>
        </div>
      </article>
    `;
  }
  list.innerHTML = DEMO_USERS.map(card).join('');
})();

/* ================== Match page: filters + cards + report ================== */
(function(){
  const grid = document.getElementById('match-grid');
  const form = document.getElementById('match-filter');
  if(!grid || !form) return;

  function card(u){
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
  function render(list){ grid.innerHTML = list.map(card).join(''); }

  function apply(){
    const fd = new FormData(form);
    const gender = String(fd.get('gender')||'').toLowerCase();
    const min = Number(fd.get('min_age')||18);
    const max = Number(fd.get('max_age')||80);
    const interest = String(fd.get('interest')||'').toLowerCase().trim();

    const res = DEMO_USERS.filter(u=>{
      const byG = gender? u.gender.toLowerCase()===gender : true;
      const byA = u.age>=min && u.age<=max;
      const byI = interest? u.interests.some(i=>i.toLowerCase().includes(interest)) : true;
      return byG && byA && byI;
    });
    render(res);
    window.__notify?.toast(`Found ${res.length} candidate(s).`);
  }

  render(DEMO_USERS);
  form.addEventListener('submit', e=>{ e.preventDefault(); apply(); });
  form.addEventListener('reset', ()=> setTimeout(()=>{ render(DEMO_USERS); window.__notify?.toast('Filters cleared.'); },0));

  grid.addEventListener('click', e=>{
    const btn = e.target.closest('.report-btn'); if(!btn) return;
    const name = btn.dataset.name;
    document.dispatchEvent(new CustomEvent('open-report',{ detail:{ label:`Reporting ${name}` }}));
    window.__report?.open({ user: btn.dataset.id });
  });
})();

/* ================== Chat page: dialog + notifications + echo bot ================== */
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
    li.textContent = (who==='bot'?'LoveLink: ':'You: ') + text;
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

/* ================== User profile page ================== */
(function(){
  const box = document.getElementById('user-view'); if(!box) return;
  const params = new URLSearchParams(location.search); const name = params.get('name');
  const u = DEMO_USERS.find(x=>x.name.toLowerCase() === String(name||'').toLowerCase());
  if(!u){ box.innerHTML = `<h2>User not found</h2><p class="muted">The user you are looking for does not exist.</p>`; return; }

  box.innerHTML = `
    <h2>${u.name}</h2>
    <p class="user-meta">Age ${u.age} · ${u.gender}</p>
    <p>Interests: ${u.interests.map(t=>`<span class="tag">${t}</span>`).join(' ')}</p>
    <p>${u.about||''}</p>
    <div class="row">
      <a class="btn primary" href="chat.html">Say hi</a>
      <button class="btn ghost" id="report-user">Report</button>
    </div>
  `;
  document.getElementById('report-user')?.addEventListener('click', ()=>{
    document.dispatchEvent(new CustomEvent('open-report',{ detail:{ label:`Reporting ${u.name}` }}));
    window.__report?.open({ user: u.id });
  });
})();

/* ================== Auth (demo) ================== */
(function(){
  const tabs = document.getElementById('auth-tabs');
  if(!tabs) return;
  const tabLogin = document.getElementById('tab-login');
  const tabSignup = document.getElementById('tab-signup');
  const panelLogin = document.getElementById('panel-login');
  const panelSignup = document.getElementById('panel-signup');

  function switchTo(kind){
    const login = kind==='login';
    tabLogin.setAttribute('aria-selected', String(login));
    tabSignup.setAttribute('aria-selected', String(!login));
    panelLogin.hidden = !login;
    panelSignup.hidden = login;
  }
  tabLogin?.addEventListener('click', ()=>switchTo('login'));
  tabSignup?.addEventListener('click', ()=>switchTo('signup'));

  if(location.hash==='#signup') switchTo('signup');

  const accounts = load('accounts', []);
  function saveAcc(list){ save('accounts', list); }

  // Signup
  const reg = document.getElementById('register-form');
  reg?.addEventListener('submit', e=>{
    e.preventDefault();
    if(!reg.checkValidity()) return reg.reportValidity();
    const fd = new FormData(reg);
    const email = String(fd.get('email')).toLowerCase().trim();
    const password = String(fd.get('password'));
    const username = String(fd.get('username')).trim();

    if(accounts.find(a=>a.email===email)){
      alert('This email is already registered (demo). Try logging in.');
      return;
    }
    accounts.push({email, password, username});
    saveAcc(accounts);
    save('session.userId', email);
    alert('Account created! (demo)');
    location.href = 'settings.html';
  });

  // Login
  const login = document.getElementById('login-form');
  login?.addEventListener('submit', e=>{
    e.preventDefault();
    if(!login.checkValidity()) return login.reportValidity();
    const fd = new FormData(login);
    const email = String(fd.get('email')).toLowerCase().trim();
    const password = String(fd.get('password'));

    const hit = accounts.find(a=>a.email===email && a.password===password);
    if(hit){
      save('session.userId', email);
      alert('Login success! (demo)');
      location.href = 'settings.html';
    }else{
      alert('Incorrect email or password (demo).');
    }
  });
})();

/* ================== Session helper (demo) ================== */
(function(){
  if(!localStorage.getItem('session.userId')){
    localStorage.setItem('session.userId', 'u_guest');
  }
})();

/* ================== Settings: privacy load/save + logout/delete ================== */
(function(){
  const form = document.getElementById('privacy-form');
  const btnLogout = document.getElementById('btn-logout');
  const btnDelete = document.getElementById('btn-delete');
  if(!form && !btnLogout && !btnDelete) return;

  const userId = localStorage.getItem('session.userId') || 'u_guest';
  const key = `privacy:${userId}`;
  const defaults = {
    visibility: 'everyone',
    distance_blur: 0,
    discover_gender: '',
    discover_age_min: 18,
    discover_age_max: 80,
    discover_interests: '',
    quiet_from: 22,
    quiet_to: 8,
    notify_on: true
  };

  const saved = (()=>{ try{ return JSON.parse(localStorage.getItem(key) || 'null'); }catch{ return null }})();
  const data = Object.assign({}, defaults, saved || {});
  if(form){
    Object.entries(data).forEach(([k,v])=>{
      const el = form.elements?.[k];
      if(!el) return;
      if(el.type === 'checkbox') el.checked = Boolean(v);
      else el.value = String(v ?? '');
    });

    form.addEventListener('submit', (e)=>{
      e.preventDefault();
      const fd = new FormData(form);
      const out = {
        visibility: fd.get('visibility'),
        distance_blur: Number(fd.get('distance_blur') || 0),
        discover_gender: String(fd.get('discover_gender') || ''),
        discover_age_min: Number(fd.get('discover_age_min') || 18),
        discover_age_max: Number(fd.get('discover_age_max') || 80),
        discover_interests: String(fd.get('discover_interests') || ''),
        quiet_from: Number(fd.get('quiet_from') || 22),
        quiet_to: Number(fd.get('quiet_to') || 8),
        notify_on: fd.get('notify_on') === 'on'
      };
      localStorage.setItem(key, JSON.stringify(out));
      window.__notify?.toast?.('Privacy settings saved');
    });

    form.addEventListener('reset', ()=>{
      setTimeout(()=>{
        Object.entries(defaults).forEach(([k,v])=>{
          const el = form.elements[k]; if(!el) return;
          if(el.type === 'checkbox') el.checked = Boolean(v);
          else el.value = String(v ?? '');
        });
        window.__notify?.toast?.('Settings reset (not saved)');
      },0);
    });
  }

  btnLogout?.addEventListener('click', ()=>{
    localStorage.removeItem('session.userId');
    window.__notify?.toast?.('You have been logged out');
    location.href = 'index.html';
  });

  btnDelete?.addEventListener('click', ()=>{
    const ok = confirm('Delete local account data? This cannot be undone (demo only).');
    if(!ok) return;
    localStorage.removeItem(`privacy:${userId}`);
    localStorage.removeItem(`profile:${userId}`);
    localStorage.removeItem('session.userId');
    try{
      const acc = JSON.parse(localStorage.getItem('accounts')||'[]');
      const i = acc.findIndex(a=>a.id===userId || a.email===userId);
      if(i>=0){ acc.splice(i,1); localStorage.setItem('accounts', JSON.stringify(acc)); }
    }catch{}
    localStorage.removeItem('reports');
    window.__notify?.toast?.('Local account deleted');
    location.href = 'index.html';
  });
})();

/* ================== Apply privacy presets to Match form ================== */
(function(){
  const grid = document.getElementById('match-grid');
  const form = document.getElementById('match-filter');
  if(!grid || !form) return;
  const userId = localStorage.getItem('session.userId') || 'u_guest';
  const pref = (()=>{ try{ return JSON.parse(localStorage.getItem(`privacy:${userId}`)||'null'); }catch{return null} })() || {};
  if(pref.discover_gender && form.elements['gender']) form.elements['gender'].value = pref.discover_gender;
  if(pref.discover_age_min && form.elements['min_age']) form.elements['min_age'].value = pref.discover_age_min;
  if(pref.discover_age_max && form.elements['max_age']) form.elements['max_age'].value = pref.discover_age_max;
  if(pref.discover_interests && form.elements['interest']) form.elements['interest'].value = pref.discover_interests.split(',')[0]?.trim() || '';
})();
