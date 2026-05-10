import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, deleteUser } from "firebase/auth";
import { db, loadFromFS, saveProfileToFS } from './db.js';
import { ADMIN_EMAIL } from './config.js';

const auth = getAuth();
const provider = new GoogleAuthProvider();

// Window globals for cross-module state
window.currentUser = null;
window.isAdmin = false;
window.plan = { tier: 'free', expires: null, since: null };

export function getAuthInstance() { return auth; }

export function setupAuth() {
  var btnLogin = document.getElementById('btnLogin');
  var btnLogout = document.getElementById('btnLogout');

  if (btnLogin) {
    btnLogin.addEventListener('click', async function() {
      try {
        await signInWithPopup(auth, provider);
      } catch (error) {
        console.error('Login error:', error);
        if (window.showToast) window.showToast('Error al iniciar sesión con Google');
      }
    });
  }

  if (btnLogout) {
    btnLogout.addEventListener('click', async function() {
      try {
        await signOut(auth);
        if (window.showToast) window.showToast(t('toastLogout'));
      } catch (error) {
        console.error('Logout error:', error);
      }
    });
  }

  onAuthStateChanged(auth, async function(user) {
    var btnLogin = document.getElementById('btnLogin');
    var userPill = document.getElementById('userPill');
    var userDisplayName = document.getElementById('userDisplayName');
    var userAvatarWrap = document.getElementById('userAvatarWrap');

    if (user) {
      window.currentUser = user;
      window.isAdmin = user.email === ADMIN_EMAIL;
      if (window.isAdmin) {
        window.plan.tier = 'pro_annual';
        window.plan.expires = null;
        window.plan.since = new Date().toISOString();
        saveProfileToFS().catch(function() {});
      }
      if (btnLogin) btnLogin.style.display = 'none';
      if (userPill) userPill.classList.add('show');
      if (userDisplayName) userDisplayName.textContent = user.displayName || 'Usuario';
      if (userAvatarWrap) {
        if (user.photoURL) {
          userAvatarWrap.innerHTML = '<img class="user-avatar" src="' + user.photoURL + '" alt="Avatar">';
        } else {
          userAvatarWrap.innerHTML = '<div class="user-initials">' + (user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U') + '</div>';
        }
      }
      // Profile hero
      var heroAvatar = document.getElementById('heroAvatar');
      if (heroAvatar) {
        if (user.photoURL) {
          heroAvatar.innerHTML = '<img src="' + user.photoURL + '" alt="Avatar">';
        } else {
          heroAvatar.textContent = user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U';
        }
      }
      var heroEmail = document.getElementById('heroEmail');
      if (heroEmail) heroEmail.textContent = user.email || '';
      await loadFromFS(user.uid);
    } else {
      window.currentUser = null;
      if (btnLogin) btnLogin.style.display = 'inline-flex';
      if (userPill) userPill.classList.remove('show');
      var heroAvatar = document.getElementById('heroAvatar');
      if (heroAvatar) heroAvatar.textContent = '?';
      var heroEmail = document.getElementById('heroEmail');
      if (heroEmail) heroEmail.textContent = '';
    }
  });
}

export function isPro() {
  return window.isAdmin || (window.plan.tier !== 'free' && (!window.plan.expires || new Date(window.plan.expires) > new Date()));
}
export function planLabel() {
  if (window.isAdmin) return '👑 Admin';
  if (window.plan.tier === 'pro_annual') return '💎 Pro Anual';
  if (window.plan.tier === 'pro_monthly') return '⚡ Pro Mensual';
  return '🎯 Gratis';
}
export function planTierName() {
  if (window.plan.tier === 'pro_annual') return 'Pro Anual';
  if (window.plan.tier === 'pro_monthly') return 'Pro Mensual';
  return 'Gratis';
}

// Window exports
window.isPro = isPro;
window.planLabel = planLabel;
window.planTierName = planTierName;
window.isAdmin = false;
window.plan = { tier: 'free', expires: null, since: null };

window.handleMenuAction = function(action) {
  var menuDotsBtn = document.getElementById('menuDotsBtn');
  var menuDropdown = document.getElementById('menuDropdown');
  var langDropdown = document.getElementById('langDropdown');
  if (menuDotsBtn) menuDotsBtn.classList.remove('active');
  if (menuDropdown) menuDropdown.classList.remove('open');
  if (langDropdown) langDropdown.classList.remove('open');
  if (action === 'help' || action === 'terms' || action === 'history' || action === 'plan' || action === 'profile' || action === 'settings' || action === 'subscription') {
    if (action === 'subscription') { if (window.showPlanDetails) window.showPlanDetails(); return; }
    window.goToPage(action);
    if (action === 'history' && typeof window.renderHistory === 'function') window.renderHistory();
    if (action === 'profile' && typeof window.renderProfile === 'function') window.renderProfile();
    if (action === 'plan' && typeof window.renderPlan === 'function') window.renderPlan();
    if (action === 'settings' && typeof window.renderSettings === 'function') window.renderSettings();
  }
};

window.deleteAccount = function() {
  if (!confirm('¿Estás seguro de eliminar tu cuenta? Esta acción no se puede deshacer.')) return;
  if (!window.currentUser) { if (window.showToast) window.showToast('No hay sesión activa'); return; }
  deleteDoc(doc(db, 'users', window.currentUser.uid)).then(function() {
    window.currentUser.delete().then(function() {
      if (window.showToast) window.showToast('🗑️ Cuenta eliminada');
    }).catch(function(e) {
      if (window.showToast) window.showToast('Error al eliminar cuenta');
      console.error(e);
    });
  }).catch(function(e) {
    if (window.showToast) window.showToast('Error al eliminar datos');
    console.error(e);
  });
};

window.selectPlan = function(plan) {
  window._selectedPlan = plan;
  var mCard = document.getElementById('planMonthCard');
  var yCard = document.getElementById('planYearCard');
  if (mCard) mCard.classList.toggle('selected', plan === 'month');
  if (yCard) yCard.classList.toggle('selected', plan === 'year');
  var btn = document.getElementById('btnUpgradeMain');
  if (btn) btn.className = 'btn-upgrade' + (plan === 'year' ? ' gold-btn' : '');
};

window.handleUpgrade = function() {
  window.plan.tier = 'pro_monthly';
  window.plan.since = new Date().toISOString();
  window.plan.expires = new Date(Date.now() + 30 * 86400000).toISOString();
  lsSet('nl_plan', window.plan);
  saveProfileToFS().catch(function() {});
  window.closeModal();
  if (window.updateUsageUI) window.updateUsageUI();
  if (window.showToast) window.showToast(window.t ? window.t('toastUpgradeSim') : '🚀 Modo Pro activado (demo)', 3000);
  if (window.triggerConfetti) window.triggerConfetti();
};
