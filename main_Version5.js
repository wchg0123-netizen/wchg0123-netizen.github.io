/* -------------- 主题 / 导航 / 年份（与之前相同，已精简） -------------- */
(function(){
  const root = document.documentElement, btn=document.getElementById('theme-toggle');
  if(!btn) return; const saved=localStorage.getItem('theme'); if(saved==='dark') root.classList.add('dark');
  btn.setAttribute('aria-pressed', root.classList.contains('dark'));
  btn.addEventListener('click',()=>{root.classList.toggle('dark');const d=root.classList.contains('dark');localStorage.setItem('theme',d?'dark':'light');btn.setAttribute('aria-pressed',d);});
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

/* -------------------- Demo 数据 & 通用工具 -------------------- */
const DEMO_USERS = [
  { name:'Luna', age:22, gender:'Female', hobby:'music', about:'Coffee & lo-fi beats.' },
  { name:'Milo', age:25, gender:'Male',   hobby:'basketball', about:'Weekend hooper.' },
  { name:'Nabi', age:21, gender:'Female', hobby:'reading',    about:'Bookworm.' },
  { name:'Kuro', age:28, gender:'Male',   hobby:'gaming',     about:'RPG lover.' },
  { name:'Sora', age:24, gender:'Male',   hobby:'music',      about:'Guitar practice.' },
  { name:'Mimi', age:26, gender:'Female', hobby:'travel',     about:'Backpacker.' },
];

function save(k,v){ localStorage.setItem(k, JSON.stringify(v)); }
function load(k, fallback=null){ try{ const v = localStorage.getItem(k); return v? JSON.parse(v): fallback; }catch(_){ return fallback; } }

/* -------------------- Users 列表 + 筛选 + 可点击卡片 -------------------- */
(function(){
  const list = document.getElementById('user-list');
  const form = document.getElementById('user-filter');
  if(!list||!form) return;

  function render(arr){
    list.innerHTML = arr.map(u=>`
      <a class="card user-card" tabindex="0" href="user.html?name=${encodeURIComponent(u.name)}">
        <h3>${u.name}</h3>
        <p class="user-meta">Age ${u.age} · ${u.gender} · Hobby: ${u.hobby}</p>
        <span class="btn ghost like" aria-hidden="true">View profile →</span>
      </a>
    `).join('');
  }
  function filter(fd){
    const age=Number(fd.get('age'));
    const gender=String(fd.get('gender')||'').toLowerCase();
    const hobby=String(fd.get('hobby')||'').toLowerCase().trim();
    return DEMO_USERS.filter(u=>{
      const byAge = age? u.age===age : true;
      const byG = gender? u.gender.toLowerCase()===gender : true;
      const byH = hobby? u.hobby.toLowerCase().includes(hobby) : true;
      return byAge && byG && byH;
    });
  }
  render(DEMO_USERS);
  form.addEventListener('submit',e=>{ e.preventDefault(); const fd=new FormData(form); render(filter(fd)); });
  form.addEventListener('reset',()=> setTimeout(()=>render(DEMO_USERS),0));
})();

/* -------------------- 用户详情页 user.html -------------------- */
(function(){
  const box = document.getElementById('user-view'); if(!box) return;
  const params = new URLSearchParams(location.search); const name = params.get('name');
  const u = DEMO_USERS.find(x=>x.name.toLowerCase() === String(name||'').toLowerCase());
  if(!u){ box.innerHTML = `<h2>User not found</h2><p class="muted">The user you are looking for does not exist.</p>`; return; }

  box.innerHTML = `
    <h2>${u.name}</h2>
    <p class="user-meta">Age ${u.age} · ${u.gender} · Hobby: ${u.hobby}</p>
    <p>${u.about||''}</p>
    <div class="row">
      <a class="btn primary" href="chat.html">Say hi</a>
      <a class="btn ghost" href="users.html">Back</a>
    </div>
  `;
})();

/* -------------------- Match -------------------- */
(function(){
  const btn=document.getElementById('match-btn'), out=document.getElementById('match-result');
  if(!btn||!out) return;
  btn.addEventListener('click',()=>{
    const pick = DEMO_USERS[Math.floor(Math.random()*DEMO_USERS.length)].name;
    out.textContent = `You matched with ${pick} 🎉`;
  });
})();

/* -------------------- Chat -------------------- */
(function(){
  const log=document.getElementById('chat-log'), form=document.getElementById('chat-form'), input=document.getElementById('chat-input');
  if(!log||!form||!input) return;
  function add(text,who='you'){ const li=document.createElement('li'); li.textContent=(who==='bot'?'Meow: ':'You: ')+text; log.appendChild(li); log.scrollTop=log.scrollHeight; }
  form.addEventListener('submit',e=>{ e.preventDefault(); const t=input.value.trim(); if(!t) return; add(t,'you'); input.value=''; setTimeout(()=>add('Meow~ Nice to meet you!','bot'),400); });
})();

/* -------------------- Auth（注册 / 登录 / 忘记密码） -------------------- */
/* localStorage keys:
   - accounts: [{email, password, username}]
   - session: { email }
*/
(function(){
  const accounts = load('accounts', []);
  function saveAcc(list){ save('accounts', list); }

  // Signup (Create account)
  const reg = document.getElementById('register-form');
  reg?.addEventListener('submit', e=>{
    e.preventDefault();
    if(!reg.checkValidity()) retu
