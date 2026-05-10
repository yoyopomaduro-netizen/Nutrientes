// Import modules for side effects (they set up window globals)
import './i18n.js';
import './auth.js';
import './ui.js';
import './nutrition.js';
import './scanner.js';
import './coach.js';
import './plans.js';
import './profile.js';
import './analytics.js';

// Explicit imports for functions used directly
import { t, currentLang, applyLanguage } from './i18n.js';
import { lsGet, lsSet, saveProfileToFS, clearFSHistory } from './db.js';
import { showToast, goToPage, triggerConfetti, rotateTicker, updateUsageUI, initMenu } from './ui.js';
import { setupAuth, isPro } from './auth.js';
import { updateMetasUI, updateSelectOptions } from './nutrition.js';
import { initHealthConditions, updateBackButtonVisibility } from './profile.js';
import { restoreCoachHistory } from './coach.js';
import { renderHistory } from './analytics.js';
import { GLOBAL_BRAIN } from './config.js';

window.t = t;
window.currentLang = currentLang;
window.lsGet = lsGet;
window.lsSet = lsSet;
window.updateUsageUI = updateUsageUI;
window.applyLanguage = applyLanguage;
window.GLOBAL_BRAIN = GLOBAL_BRAIN;

function initApp() {
  var secondaryPages = ['page-help','page-terms','page-history','page-plan','page-profile','page-settings'];
  secondaryPages.forEach(function(id) {
    var el = document.getElementById(id);
    if (el && el.parentElement && el.parentElement.tagName !== 'BODY') document.body.appendChild(el);
  });
  console.log('🚀 NutriLent AI inicializado...');
  applyLanguage();
  setupAuth();
  initMenu();
  goToPage('scan');
  initHealthConditions();

  document.querySelectorAll('.form-group select').forEach(function(s) {
    s.addEventListener('change', function() { this.classList.toggle('has-value', !!this.value); });
  });

  var fab = document.getElementById('themeFab');
  var savedTheme = localStorage.getItem('nl_theme');
  if (savedTheme === 'light') {
    document.body.classList.add('light');
    if (fab) fab.textContent = '🌙';
  } else if (fab) fab.textContent = '☀️';

  renderHistory();
  renderPlan();
  renderProfile();
  renderSettings();
  restoreCoachHistory();

  updateBackButtonVisibility();

  var backHomeBtn = document.getElementById('backHomeBtn');
  if (backHomeBtn) backHomeBtn.addEventListener('click', function() { goToPage('scan'); });

  var fileInput = document.getElementById('fileInput');
  if (fileInput) {
    fileInput.addEventListener('change', async function(e) {
      var file = e.target.files?.[0];
      if (!file) return;
      try {
        window.imageBase64 = await resizeImage(file);
        showPreview(window.imageBase64);
      } catch (err) {
        console.error('❌ Error al procesar imagen:', err);
        showToast('Error al cargar la imagen');
      }
    });
    fileInput.addEventListener('click', function() { this.value = ''; });
  }

  var btnClearHist = document.getElementById('btnClearHist');
  if (btnClearHist) {
    btnClearHist.addEventListener('click', function() {
      if (!confirm('¿Borrar todo el historial?')) return;
      window.historyData = [];
      lsSet('nl_history', []);
      if (window.currentUser) clearFSHistory().catch(function() {});
      updateMetasUI();
      renderHistory();
      showToast('🗑️ Historial eliminado');
    });
  }

  var btnProSmall = document.getElementById('btnProSmall');
  if (btnProSmall) btnProSmall.addEventListener('click', function() { window.openModal(); });

  window.waterIntake = parseFloat(localStorage.getItem('nl_water')) || 0;
  window.hydrationGoal = parseFloat(localStorage.getItem('nl_hydration')) || 2.5;
  window.updateHydrationDisplay = function() {
    var wf = document.getElementById('waterFill');
    var wc = document.getElementById('waterCurrent');
    var wg = document.getElementById('waterGoalDisplay');
    if (wg) wg.textContent = window.hydrationGoal.toFixed(1);
    if (wc) wc.textContent = window.waterIntake.toFixed(1);
    if (wf) {
      var goal = window.hydrationGoal || 2.5;
      var pct = Math.min((window.waterIntake / goal) * 100, 100);
      wf.style.width = pct + '%';
      wf.style.background = window.waterIntake >= goal ? 'linear-gradient(90deg,#4fc3f7,#AAFF00)' : 'linear-gradient(90deg,#4fc3f7,#29b6f6)';
    }
  };

  var hydrateMinus = document.getElementById('hydrateMinus');
  var hydratePlus = document.getElementById('hydratePlus');
  if (hydrateMinus) {
    hydrateMinus.addEventListener('click', function() {
      window.hydrationGoal = Math.max(0.5, (window.hydrationGoal || 2.5) - 0.25);
      localStorage.setItem('nl_hydration', window.hydrationGoal);
      if (window.updateHydrationDisplay) window.updateHydrationDisplay();
    });
  }
  if (hydratePlus) {
    hydratePlus.addEventListener('click', function() {
      window.hydrationGoal = Math.min(5, (window.hydrationGoal || 2.5) + 0.25);
      localStorage.setItem('nl_hydration', window.hydrationGoal);
      if (window.updateHydrationDisplay) window.updateHydrationDisplay();
    });
  }

  var waterMinus = document.getElementById('waterMinus');
  var waterPlus = document.getElementById('waterPlus');
  if (waterMinus) {
    waterMinus.addEventListener('click', function() {
      window.waterIntake = Math.max(0, (window.waterIntake || 0) - 0.25);
      localStorage.setItem('nl_water', window.waterIntake);
      if (window.updateHydrationDisplay) window.updateHydrationDisplay();
    });
  }
  if (waterPlus) {
    waterPlus.addEventListener('click', function() {
      window.waterIntake = Math.min(5, (window.waterIntake || 0) + 0.25);
      localStorage.setItem('nl_water', window.waterIntake);
      if (window.updateHydrationDisplay) window.updateHydrationDisplay();
    });
  }

  var btnSaveProfile = document.getElementById('btnSaveProfile');
  if (btnSaveProfile) {
    btnSaveProfile.addEventListener('click', function() {
      var pNombre = document.getElementById('pNombre');
      var pEdad = document.getElementById('pEdad');
      var pPeso = document.getElementById('pPeso');
      var pAltura = document.getElementById('pAltura');
      var pSexo = document.getElementById('pSexo');
      var pObjetivo = document.getElementById('pObjetivo');
      var pActividad = document.getElementById('pActividad');
      window.profile.nombre = pNombre ? pNombre.value : '';
      window.profile.edad = parseInt(pEdad ? pEdad.value : 0) || 0;
      window.profile.peso = parseFloat(pPeso ? pPeso.value : 0) || 0;
      window.profile.altura = parseFloat(pAltura ? pAltura.value : 0) || 0;
      window.profile.sexo = pSexo ? pSexo.value : 'm';
      window.profile.objetivo = pObjetivo ? pObjetivo.value : 'mantener';
      window.profile.actividad = pActividad ? parseFloat(pActividad.value) : 1.375;
      var factor = window.profile.actividad;
      var tmb = window.profile.sexo === 'm'
        ? (10 * window.profile.peso + 6.25 * window.profile.altura - 5 * window.profile.edad + 5)
        : (10 * window.profile.peso + 6.25 * window.profile.altura - 5 * window.profile.edad - 161);
      var cal = Math.round(tmb * factor);
      if (window.profile.objetivo === 'bajar') cal = Math.round(cal * 0.8);
      else if (window.profile.objetivo === 'musculo') cal = Math.round(cal * 1.1);
      window.metas.cal = cal;
      window.metas.prot = Math.round(cal * 0.3 / 4);
      window.metas.carbs = Math.round(cal * 0.4 / 4);
      window.metas.fats = Math.round(cal * 0.3 / 9);
      lsSet('nl_profile', window.profile);
      lsSet('nl_metas', window.metas);
      if (window.currentUser) saveProfileToFS().catch(function() {});
      updateMetasUI();
      updateUsageUI();
      var summaryCal = document.getElementById('summaryCalories');
      var summaryProt = document.getElementById('summaryProtein');
      if (summaryCal) summaryCal.textContent = cal ? cal + ' kcal' : '—';
      if (summaryProt) summaryProt.textContent = window.metas.prot ? window.metas.prot + 'g' : '—';
      window.updateProfileHeader(pNombre ? pNombre.value : '');
      showToast('✅ Perfil guardado');
    });
  }

  // Initial hydration display
  if (window.updateHydrationDisplay) window.updateHydrationDisplay();

  // Motivation ticker rotation
  var ticker = document.getElementById('motivationTicker');
  if (ticker) setInterval(rotateTicker, 5000);

  // Browser console helper
  console.log('%c🍽️ NutriLent AI v2.1', 'font-size:20px;font-weight:bold;color:#AAFF00;');
  console.log('%cHecho con 💚 para Colombia', 'font-size:12px;color:#50f0b8;');
}

window.initApp = initApp;

// DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
