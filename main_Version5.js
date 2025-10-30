// Page navigation
document.querySelectorAll('nav a').forEach(link => {
  link.addEventListener('click', function(e) {
    e.preventDefault();
    const id = this.getAttribute('href').replace('#','');
    document.querySelectorAll('section.page').forEach(sec => sec.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    window.scrollTo(0,0);
  });
});

// Example user data for catalogue
const users = [
  { name: 'John', age: 25, gender: 'Male', hobbies: 'Fitness' },
  { name: 'Lisa', age: 30, gender: 'Female', hobbies: 'Travel' },
  { name: 'David', age: 28, gender: 'Male', hobbies: 'Reading' },
  { name: 'Sophia', age: 22, gender: 'Female', hobbies: 'Food' }
];

function renderUsers(list) {
  const ul = document.getElementById('userList');
  ul.innerHTML = '';
  list.forEach(u => {
    const li = document.createElement('li');
    li.textContent = `${u.name}, ${u.gender}, ${u.age} years old, Hobbies: ${u.hobbies}`;
    ul.appendChild(li);
  });
}
renderUsers(users);

document.getElementById('searchForm').onsubmit = function(e) {
  e.preventDefault();
  const age = parseInt(this.elements[0].value) || null;
  const gender = this.elements[1].value;
  const hobby = this.elements[2].value.trim();
  let filtered = users;
  if(age) filtered = filtered.filter(u=>u.age === age);
  if(gender) filtered = filtered.filter(u=>u.gender === gender);
  if(hobby) filtered = filtered.filter(u=>u.hobbies.includes(hobby));
  renderUsers(filtered);
};

// Matching system demo
document.getElementById('matchBtn').onclick = function() {
  const rnd = users[Math.floor(Math.random()*users.length)];
  document.getElementById('matchResult').textContent =
    `Recommended for you: ${rnd.name}, ${rnd.gender}, ${rnd.age} years old, Hobbies: ${rnd.hobbies}`;
};

// Chat UI demo
document.getElementById('chatForm').onsubmit = function(e) {
  e.preventDefault();
  const msg = document.getElementById('chatInput').value.trim();
  if(msg){
    const div = document.createElement('div');
    div.textContent = `Me: ${msg}`;
    document.getElementById('messages').appendChild(div);
    document.getElementById('chatInput').value = '';
  }
};

// Registration/Login/Feedback/Contact form demo (front-end only)
document.getElementById('registerForm').onsubmit = function(e){
  e.preventDefault();
  document.getElementById('registerResult').textContent = 'Registration successful! (Demo only, no backend)';
  this.reset();
};
document.getElementById('loginForm').onsubmit = function(e){
  e.preventDefault();
  document.getElementById('loginResult').textContent = 'Login successful! (Demo only, no backend)';
  this.reset();
};
document.getElementById('feedbackForm').onsubmit = function(e){
  e.preventDefault();
  const txt = this.elements[0].value.trim();
  if(txt){
    const li = document.createElement('li');
    li.textContent = `You: "${txt}"`;
    document.getElementById('feedbackList').appendChild(li);
    this.reset();
  }
};
document.getElementById('contactForm').onsubmit = function(e){
  e.preventDefault();
  alert('Your question has been submitted! (Demo only)');
  this.reset();
};