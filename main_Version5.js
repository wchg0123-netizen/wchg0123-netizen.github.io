/* -----------------------------------------------------------------------------
   Meow Dating – Page Scripts (Multi-page)
   This single JS file is shared across all pages. It safely no-ops when
   elements are missing on a given page.
   Features:
   - Dark mode toggle (persisted)
   - Mobile nav toggle + active nav highlighting (auto)
   - Year injection in footer
   - Users page: demo data + filter + card rendering
   - Match page: random match demo
   - Chat page: simple echo chat
   - Forms: basic client-side validation alerts
   - Login page: Login / Create account tabs (merged register)
   ----------------------------------------------------------------------------- */

/* -------------------- Theme toggle -------------------- */
(function(){
  const root = document.documentElement;
  const btn = document.getElementById('theme-toggle');
  if (!btn) return;

  const saved = localStorage.getItem('theme');
  if (saved === 'dark') root.classList.add('dark');
  btn.setAttribute('aria-pressed', root.classList.contains('dark'));

  btn.addEventListener('click', () => {
    root.classList.toggle('dark');
    const isDark = root.classList.contains('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    btn.setAttribute('aria-pressed', isDark);
  });
})();

/* -------------------- Mobile nav -------------------- */
(function(){
  const toggle = document.querySelector('.nav-toggle');
  const list = document.getElementById('nav-list');
  if (!toggle || !list) return;

  toggle.addEventListener('click', () => {
    const open = list.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
  });

  // Close menu when clicking a link (mobile)
  list.addEventListener('click', e => {
    const a = e.target.closest('a');
    if (!a) return;
    list.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
  });
})();

/* -------------------- Active nav highlight (auto) -------------------- */
(function(){
  const list = document.getElementById('nav-list');
  if (!list) return;
  const path = (location.pathname.split('/').pop() || '').toLowerCase();
  // default to index.html when at repo root
  const file = path === '' ? 'index.html' : path;

  list.querySelectorAll('a').forEach(a => {
    const href = (a.getAttribute('href') || '').toLowerCase();
    const isActive = (href === file) || (file === 'index.html' && href.endsWith('index.html'));
    a.classList.toggle('active', isActive);
    a.setAttribute('aria-current', isActive ? 'page' : 'false');
  });
})();

/* -------------------- Footer year -------------------- */
(function(){
  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
})();

/* -------------------- Utility: form binder -------------------- */
function bindSimpleForm(id){
  const form = document.getElementById(id);
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    if (!form.checkValidity()){
      form.reportValidity();
      return;
    }
    alert('Submitted! (demo only)');
    form.reset();
  });
}

/* -------------------- Users page -------------------- */
(function(){
  const userList = document.getElementById('user-list');
  const filterForm = document.getElementById('user-filter');
  if (!userList || !filterForm) return;

  const USERS = [
    { name:'Luna', age:22, gender:'Female', hobby:'music' },
    { name:'Milo', age:25, gender:'Male', hobby:'basketball' },
    { name:'Nabi', age:21, gender:'Female', hobby:'reading' },
    { name:'Kuro', age:28, gender:'Male', hobby:'gaming' },
    { name:'Sora', age:24, gender:'Male', hobby:'music' },
    { name:'Mimi', age:26, gender:'Female', hobby:'travel' },
  ];

  function render(list){
    userList.innerHTML = list.map(u => `
      <article class="card user-card" tabindex="0">
        <h3>${u.name}</h3>
        <p class="user-meta">Age ${u.age} · ${u.gender} · Hobby: ${u.hobby}</p>
        <button class="btn ghost like" aria-label="Like ${u.name}">♡ Like</button>
      </article>
    `).join('');
  }

  function applyFilter(fd){
    const age = Number(fd.get('age'));
    const gender = String(fd.get('gender')||'').toLowerCase();
    const hobby = String(fd.get('hobby')||'').toLowerCase().trim();

    return USERS.filter(u => {
      const byAge = age ? u.age === age : true;
      const byGender = gender ? u.gender.toLowerCase() === gender : true;
      const byHobby = hobby ? u.hobby.toLowerCase().includes(hobby) : true;
      return byAge && byGender && byHobby;
    });
  }

  render(USERS);

  filterForm.addEventListener('submit', e => {
    e.preventDefault();
    const fd = new FormData(filterForm);
    render(applyFilter(fd));
  });

  filterForm.addEventListener('reset', () => {
    // allow reset to clear immediately
    setTimeout(() => render(USERS), 0);
  });
})();

/* -------------------- Match page -------------------- */
(function(){
  const btn = document.getElementById('match-btn');
  const out = document.getElementById('match-result');
  if (!btn || !out) return;

  const USERS = ['Luna','Milo','Nabi','Kuro','Sora','Mimi'];

  btn.addEventListener('click', () => {
    const pick = USERS[Math.floor(Math.random() * USERS.length)];
    out.textContent = `You matched with ${pick} 🎉`;
  });
})();

/* -------------------- Chat page -------------------- */
(function(){
  const log = document.getElementById('chat-log');
  const form = document.getElementById('chat-form');
  const input = document.getElementById('chat-input');
  if (!log || !form || !input) return;

  function addMsg(text, who='you'){
    const li = document.createElement('li');
    li.textContent = (who === 'bot' ? 'Meow: ' : 'You: ') + text;
    log.appendChild(li);
    log.scrollTop = log.scrollHeight;
  }

  form.addEventListener('submit', e => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    addMsg(text, 'you');
    input.value = '';
    setTimeout(() => addMsg('Meow~ Nice to meet you!', 'bot'), 400);
  });
})();

/* -------------------- Forms (Feedback / Contact / Login) -------------------- */
['feedback-form','contact-form','login-form','register-form'].forEach(bindSimpleForm);

/* -------------------- Login page: tabs (Login / Create account) -------------------- */
(function(){
  const tabLogin   = document.getElementById('tab-login');
  const tabSignup  = document.getElementById('tab-signup');
  const panelLogin = document.getElementById('panel-login');
  const panelSignup= document.getElementById('panel-signup');
  const title      = document.getElementById('auth-title');

  if (!tabLogin || !tabSignup || !panelLogin || !panelSignup) return;

  function show(which){
    const isLogin = which === 'login';
    tabLogin.setAttribute('aria-selected', String(isLogin));
    tabSignup.setAttribute('aria-selected', String(!isLogin));
    panelLogin.hidden  = !isLogin;
    panelSignup.hidden =  isLogin;
    if (title) title.textContent = isLogin ? 'Welcome back' : 'Create your account';
    // focus first input in the active panel for better UX
    const target = (isLogin ? panelLogin : panelSignup).querySelector('input');
    target && target.focus({ preventScroll: true });
  }

  tabLogin.addEventListener('click', () => { history.replaceState(null,'','login.html#login'); show('login'); });
  tabSignup.addEventListener('click', () => { history.replaceState(null,'','login.html#signup'); show('signup'); });

  // deep-link support
  const hash = (location.hash || '').toLowerCase();
  show(hash.includes('signup') ? 'signup' : 'login');

  // optional fake reset
  document.getElementById('fake-reset')?.addEventListener('click', (e)=>{
    e.preventDefault(); alert('Demo only: password reset is not implemented.');
  });
})();
