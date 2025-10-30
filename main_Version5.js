// ---------- Theme toggle ----------
const root = document.documentElement;
const themeBtn = document.getElementById('theme-toggle');
if (themeBtn){
  const saved = localStorage.getItem('theme');
  if (saved === 'dark') root.classList.add('dark');
  themeBtn.setAttribute('aria-pressed', root.classList.contains('dark'));
  themeBtn.addEventListener('click', () => {
    root.classList.toggle('dark');
    const isDark = root.classList.contains('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    themeBtn.setAttribute('aria-pressed', isDark);
  });
}

// ---------- Mobile menu ----------
const navToggle = document.querySelector('.nav-toggle');
const navList = document.getElementById('nav-list');
navToggle?.addEventListener('click', () => {
  const open = navList.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', String(open));
});

// ---------- Tiny Router ----------
const ROUTES = {
  home:   { el: document.getElementById('view-home'),    title: 'Home · Meow Dating' },
  users:  { el: document.getElementById('view-users'),   title: 'Users · Meow Dating' },
  match:  { el: document.getElementById('view-match'),   title: 'Match · Meow Dating' },
  chat:   { el: document.getElementById('view-chat'),    title: 'Chat · Meow Dating' },
  register:{ el: document.getElementById('view-register'),title: 'Register · Meow Dating' },
  login:  { el: document.getElementById('view-login'),   title: 'Login · Meow Dating' },
  feedback:{ el: document.getElementById('view-feedback'),title: 'Feedback · Meow Dating' },
  contact:{ el: document.getElementById('view-contact'), title: 'Contact · Meow Dating' },
};

function parseRoute() {
  // Accept "#/users" or "#users"; default to "home"
  const raw = (location.hash || '').replace(/^#\/?/, '').trim();
  return raw && ROUTES[raw] ? raw : 'home';
}

function setActiveNav(routeKey){
  document.querySelectorAll('[data-route]').forEach(a => {
    const href = a.getAttribute('href') || '';
    const key = href.replace(/^#\/?/, '');
    a.classList.toggle('active', key === routeKey);
    a.setAttribute('aria-current', key === routeKey ? 'page' : 'false');
  });
}

function showView(routeKey){
  // Hide all views
  Object.entries(ROUTES).forEach(([key, obj]) => {
    if (!obj.el) return;
    const active = key === routeKey;
    obj.el.hidden = !active;
    obj.el.setAttribute('aria-hidden', String(!active));
  });

  // Title
  document.title = ROUTES[routeKey]?.title || 'Meow Dating';

  // Focus the main heading of the active view for a11y
  const heading = document.querySelector(`#view-${routeKey} [tabindex="-1"]`) ||
                  document.querySelector(`#view-${routeKey} h1, #view-${routeKey} h2`);
  heading?.focus({ preventScroll: true });

  // Scroll to top of main area
  document.getElementById('main')?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  setActiveNav(routeKey);
}

function handleRouteChange(){
  showView(parseRoute());
}

window.addEventListener('hashchange', handleRouteChange);
window.addEventListener('DOMContentLoaded', handleRouteChange);

// Allow clicking brand logo to go home (optional)
document.querySelector('.brand')?.addEventListener('click', () => {
  location.hash = '#/home';
});

// ---------- Demo Data & Interactions (load once) ----------

// Demo users
const USERS = [
  { name:'Luna', age:22, gender:'Female', hobby:'music' },
  { name:'Milo', age:25, gender:'Male', hobby:'basketball' },
  { name:'Nabi', age:21, gender:'Female', hobby:'reading' },
  { name:'Kuro', age:28, gender:'Male', hobby:'gaming' },
  { name:'Sora', age:24, gender:'Male', hobby:'music' },
  { name:'Mimi', age:26, gender:'Female', hobby:'travel' },
];

// Render user cards
const userList = document.getElementById('user-list');
function renderUsers(list = USERS) {
  if (!userList) return;
  userList.innerHTML = list.map(u => `
    <article class="card user-card" tabindex="0">
      <h3>${u.name}</h3>
      <p class="user-meta">Age ${u.age} · ${u.gender} · Hobby: ${u.hobby}</p>
      <button class="btn ghost like" aria-label="Like ${u.name}">♡ Like</button>
    </article>
  `).join('');
}
renderUsers();

// Filter
document.getElementById('user-filter')?.addEventListener('submit', e => {
  e.preventDefault();
  const fd = new FormData(e.target);
  const age = Number(fd.get('age'));
  const gender = String(fd.get('gender')||'').toLowerCase();
  const hobby = String(fd.get('hobby')||'').toLowerCase().trim();

  const res = USERS.filter(u => {
    const byAge = age ? u.age === age : true;
    const byG = gender ? u.gender.toLowerCase() === gender : true;
    const byH = hobby ? u.hobby.toLowerCase().includes(hobby) : true;
    return byAge && byG && byH;
  });
  renderUsers(res);
});

// Match
document.getElementById('match-btn')?.addEventListener('click', () => {
  const target = USERS[Math.floor(Math.random()*USERS.length)];
  const el = document.getElementById('match-result');
  if (el) el.textContent = `You matched with ${target.name} 🎉`;
});

// Chat
const chatLog = document.getElementById('chat-log');
function addMsg(text, who='you'){
  if (!chatLog) return;
  const li = document.createElement('li');
  li.textContent = (who === 'bot' ? 'Meow: ' : 'You: ') + text;
  chatLog.appendChild(li);
  chatLog.scrollTop = chatLog.scrollHeight;
}
document.getElementById('chat-form')?.addEventListener('submit', e => {
  e.preventDefault();
  const input = document.getElementById('chat-input');
  const text = input.value.trim();
  if(!text) return;
  addMsg(text, 'you');
  input.value = '';
  setTimeout(()=> addMsg('Meow~ Nice to meet you!', 'bot'), 400);
});

// Simple form handler
function bindSimpleForm(id){
  const form = document.getElementById(id);
  form?.addEventListener('submit', e => {
    e.preventDefault();
    if (!form.checkValidity()){
      form.reportValidity();
      return;
    }
    alert('Submitted! (demo only)');
    form.reset();
  });
}
['register-form','login-form','feedback-form','contact-form'].forEach(bindSimpleForm);

// Year
document.getElementById('year').textContent = new Date().getFullYear();
// ---- Auth tabs (login + signup in one page) ----
(function(){
  const tabLogin = document.getElementById('tab-login');
  const tabSignup = document.getElementById('tab-signup');
  const panelLogin = document.getElementById('panel-login');
  const panelSignup = document.getElementById('panel-signup');
  const title = document.getElementById('auth-title');

  if (!tabLogin || !tabSignup || !panelLogin || !panelSignup) return;

  function show(which){
    const isLogin = which === 'login';
    tabLogin.setAttribute('aria-selected', String(isLogin));
    tabSignup.setAttribute('aria-selected', String(!isLogin));
    panelLogin.hidden = !isLogin;
    panelSignup.hidden = isLogin;
    title && (title.textContent = isLogin ? 'Welcome back' : 'Create your account');
  }

  tabLogin.addEventListener('click', () => { history.replaceState(null,'','login.html#login'); show('login'); });
  tabSignup.addEventListener('click', () => { history.replaceState(null,'','login.html#signup'); show('signup'); });

  // Deep-link support: login.html#signup  / #login
  const hash = (location.hash || '').toLowerCase();
  show(hash.includes('signup') ? 'signup' : 'login');

  // Demo reset password
  document.getElementById('fake-reset')?.addEventListener('click', (e)=>{
    e.preventDefault(); alert('Demo only: password reset is not implemented.');
  });
})();
// ---- Auth tabs (login + signup in one page) ----
(function(){
  const tabLogin = document.getElementById('tab-login');
  const tabSignup = document.getElementById('tab-signup');
  const panelLogin = document.getElementById('panel-login');
  const panelSignup = document.getElementById('panel-signup');
  const title = document.getElementById('auth-title');

  if (!tabLogin || !tabSignup || !panelLogin || !panelSignup) return;

  function show(which){
    const isLogin = which === 'login';
    tabLogin.setAttribute('aria-selected', String(isLogin));
    tabSignup.setAttribute('aria-selected', String(!isLogin));
    panelLogin.hidden = !isLogin;
    panelSignup.hidden = isLogin;
    if (title) title.textContent = isLogin ? 'Welcome back' : 'Create your account';
  }

  tabLogin.addEventListener('click', () => { history.replaceState(null,'','login.html#login'); show('login'); });
  tabSignup.addEventListener('click', () => { history.replaceState(null,'','login.html#signup'); show('signup'); });

  // Deep-link: login.html#signup / #login
  const hash = (location.hash || '').toLowerCase();
  show(hash.includes('signup') ? 'signup' : 'login');

  // Demo reset password
  document.getElementById('fake-reset')?.addEventListener('click', (e)=>{
    e.preventDefault(); alert('Demo only: password reset is not implemented.');
  });
})();
