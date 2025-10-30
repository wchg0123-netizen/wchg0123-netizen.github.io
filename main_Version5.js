// 暗黑模式
const root = document.documentElement;
const themeBtn = document.getElementById('theme-toggle');
if (themeBtn) {
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

// 移动端菜单
const navToggle = document.querySelector('.nav-toggle');
const navList = document.getElementById('nav-list');
navToggle?.addEventListener('click', () => {
  const open = navList.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', String(open));
});

// 示例用户数据（生产环境请替换为真实接口数据）
const USERS = [
  { name:'Luna', age:22, gender:'Female', hobby:'music' },
  { name:'Milo', age:25, gender:'Male', hobby:'basketball' },
  { name:'Nabi', age:21, gender:'Female', hobby:'reading' },
  { name:'Kuro', age:28, gender:'Male', hobby:'gaming' },
  { name:'Sora', age:24, gender:'Male', hobby:'music' },
  { name:'Mimi', age:26, gender:'Female', hobby:'travel' },
];

const userList = document.getElementById('user-list');
function renderUsers(list = USERS) {
  userList.innerHTML = list.map(u => `
    <article class="card user-card" tabindex="0">
      <h3>${u.name}</h3>
      <p class="user-meta">Age ${u.age} · ${u.gender} · Hobby: ${u.hobby}</p>
      <button class="btn ghost" aria-label="Like ${u.name}">♡ Like</button>
    </article>
  `).join('');
}
renderUsers();

// 过滤
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

// Match 演示
document.getElementById('match-btn')?.addEventListener('click', () => {
  const target = USERS[Math.floor(Math.random()*USERS.length)];
  const el = document.getElementById('match-result');
  el.textContent = `You matched with ${target.name} 🎉`;
});

// Chat 演示
const chatLog = document.getElementById('chat-log');
function addMsg(text, who='you'){
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

// 表单校验（Register/Login/Feedback/Contact）
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

// 年份
document.getElementById('year').textContent = new Date().getFullYear();
