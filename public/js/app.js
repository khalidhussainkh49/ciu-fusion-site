// Application Client Logic & Module Renderers
let authToken = localStorage.getItem('ncs_token') || null;
let currentUser = JSON.parse(localStorage.getItem('ncs_user') || 'null');

document.addEventListener('DOMContentLoaded', () => {
  setupNavigation();
  setupAuth();
  updateUserStatusUI();
  loadModuleView('fusion');
});

function setupNavigation() {
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      navLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
      const module = link.dataset.module;
      loadModuleView(module);
    });
  });
}

function setupAuth() {
  const loginModal = document.getElementById('login-modal');
  const btnLoginModal = document.getElementById('btn-login-modal');
  const closeLoginModal = document.getElementById('close-login-modal');
  const btnLogout = document.getElementById('btn-logout');
  const formLogin = document.getElementById('form-login');

  btnLoginModal.addEventListener('click', () => loginModal.classList.remove('hidden'));
  closeLoginModal.addEventListener('click', () => loginModal.classList.add('hidden'));

  btnLogout.addEventListener('click', () => {
    authToken = null;
    currentUser = null;
    localStorage.removeItem('ncs_token');
    localStorage.removeItem('ncs_user');
    updateUserStatusUI();
    loadModuleView('fusion');
  });

  formLogin.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    const mfaCode = document.getElementById('login-mfa').value;
    const mfaGroup = document.getElementById('mfa-group');
    const loginError = document.getElementById('login-error');

    loginError.classList.add('hidden');

    try {
      if (mfaGroup.classList.contains('hidden')) {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Login failed');

        if (data.mfa_required) {
          mfaGroup.classList.remove('hidden');
          formLogin.dataset.userId = data.user_id;
        } else {
          setAuthSession(data.token, data.user);
        }
      } else {
        const userId = formLogin.dataset.userId;
        const res = await fetch('/api/auth/mfa', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: userId, mfa_code: mfaCode })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'MFA verification failed');
        setAuthSession(data.token, data.user);
      }
    } catch (err) {
      loginError.textContent = err.message;
      loginError.classList.remove('hidden');
    }
  });
}

function setAuthSession(token, user) {
  authToken = token;
  currentUser = user;
  localStorage.setItem('ncs_token', token);
  localStorage.setItem('ncs_user', JSON.stringify(user));
  document.getElementById('login-modal').classList.add('hidden');
  document.getElementById('mfa-group').classList.add('hidden');
  updateUserStatusUI();
  loadModuleView('fusion');
}

function updateUserStatusUI() {
  const userInfoText = document.getElementById('user-info-text');
  const btnLoginModal = document.getElementById('btn-login-modal');
  const btnLogout = document.getElementById('btn-logout');

  if (currentUser) {
    userInfoText.innerHTML = `Officer: <strong>${currentUser.full_name}</strong> (${currentUser.role}) <span class="badge-clearance">Clearance Level ${currentUser.clearance_level}</span>`;
    btnLoginModal.classList.add('hidden');
    btnLogout.classList.remove('hidden');
  } else {
    userInfoText.innerHTML = `Mode: Restricted Guest View`;
    btnLoginModal.classList.remove('hidden');
    btnLogout.classList.add('hidden');
  }
}

async function apiFetch(url, options = {}) {
  options.headers = options.headers || {};
  if (authToken) {
    options.headers['Authorization'] = `Bearer ${authToken}`;
  }
  const res = await fetch(url, options);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error ${res.status}`);
  }
  return res.json();
}

function loadModuleView(moduleName) {
  const mainContent = document.getElementById('main-content');
  mainContent.innerHTML = `<div style="text-align:center; padding: 40px;">Loading ${moduleName.toUpperCase()} Module...</div>`;

  switch (moduleName) {
    case 'fusion': renderFusionModule(mainContent); break;
    case 'entities': renderEntitiesModule(mainContent); break;
    case 'cargo': renderCargoModule(mainContent); break;
    case 'reports': renderReportsModule(mainContent); break;
    case 'geospatial': renderGeospatialModule(mainContent); break;
    case 'cases': renderCasesModule(mainContent); break;
    case 'cyber': renderCyberModule(mainContent); break;
    case 'interagency': renderInteragencyModule(mainContent); break;
    case 'kpi': renderKpiModule(mainContent); break;
    case 'ai': renderAiModule(mainContent); break;
    default: mainContent.innerHTML = 'Module view under development.';
  }
}
