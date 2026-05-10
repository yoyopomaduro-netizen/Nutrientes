import { t } from './i18n.js';
import { lsGet, lsSet, saveProfileToFS } from './db.js';
import { updateUsageUI } from './ui.js';
import { isPro, planLabel, planTierName } from './auth.js';
import { updateSelectOptions, updateMetasUI } from './nutrition.js';

window.updateProfileHeader = function(name) {
  var el = document.getElementById('heroUsername');
  if (el) el.textContent = name || 'Usuario';
  var emailEl = document.getElementById('heroEmail');
  if (emailEl && window.currentUser) emailEl.textContent = window.currentUser.email || '';
  var phraseEl = document.getElementById('heroPhrase');
  if (phraseEl) {
    var phrases = ['🔥 Día 1 de tu transformación','💪 Tu mejor versión empieza hoy','⚡ Hoy es un buen día para comer bien','🌱 Cada elección cuenta','🎯 Un paso a la vez hacia tu meta','✨ Pequeños cambios, grandes resultados','🌟 Hoy es el día para brillar','🚀 Tú puedes con todo','💚 Cuida tu cuerpo, es tu hogar','📈 Mejor que ayer, siempre','🏆 El esfuerzo de hoy es el triunfo de mañana','🌿 Comer bien es amarte','⚡ Energía positiva empieza en tu plato','🔥 Sigue así, vamos con todo','💫 Cada comida es una oportunidad','🎉 Celebra cada progreso, no solo la meta'];
    phraseEl.textContent = phrases[Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000) % phrases.length];
  }
  var levelEl = document.getElementById('heroLevel');
  if (levelEl) {
    var totalEntries = (window.historyData || []).length;
    var streak = parseInt(localStorage.getItem('nl_streak') || '0');
    var score = totalEntries + streak * 2;
    var level, icon;
    if (score < 15) { level = 'Principiante'; icon = '🌱'; levelEl.className = 'hero-level'; }
    else if (score < 40) { level = 'Intermedio'; icon = '🔥'; levelEl.className = 'hero-level intermedio'; }
    else { level = 'Experto'; icon = '💎'; levelEl.className = 'hero-level experto'; }
    levelEl.innerHTML = icon + ' ' + level + '<span style="margin-left:8px;opacity:0.6">·</span> <span style="color:' + (window.plan.tier !== 'free' ? '#AAFF00' : 'rgba(255,255,255,0.3)') + '">' + planLabel() + '</span>';
  }
};

window.showActivityDesc = function() {
  var el = document.getElementById('pActividad');
  if (!el) return;
  var keyMap = { '1.1': 'actividad1_1', '1.2': 'actividad1_2', '1.375': 'actividad1_375', '1.5': 'actividad1_5', '1.7': 'actividad1_7', '1.9': 'actividad1_9' };
  showToast('📊 ' + t(keyMap[el.value] || 'actividad1_375'));
};

export function setupObjectivePills() {
  var container = document.getElementById('pillObjectiveSelector');
  if (!container) return;
  var select = document.getElementById('pObjetivo');
  var ops = [
    { value: 'bajar', label: '🔥 Bajar de peso' },
    { value: 'mantener', label: '⚖️ Mantener' },
    { value: 'musculo', label: '💪 Ganar músculo' }
  ];
  container.innerHTML = '';
  ops.forEach(function(o) {
    var pill = document.createElement('button');
    pill.type = 'button';
    pill.className = 'pill-option' + (select && select.value === o.value ? ' active' : '');
    pill.textContent = o.label;
    pill.dataset.value = o.value;
    pill.onclick = function() {
      container.querySelectorAll('.pill-option').forEach(function(p) { p.classList.remove('active'); });
      pill.classList.add('active');
      if (select) { select.value = o.value; select.dispatchEvent(new Event('change')); }
    };
    container.appendChild(pill);
  });
}

export function updateHydrationDisplay() {
  var el = document.getElementById('hydrateValue');
  if (el) el.textContent = (window.hydrationGoal || 2.5).toFixed(2).replace('.', ',') + ' L';
}

export function initHealthConditions() {
  var saved = lsGet('nl_conditions', []);
  document.querySelectorAll('.health-chip').forEach(function(chip) {
    var cond = chip.getAttribute('data-cond');
    if (saved.includes(cond)) chip.classList.add('active');
  });
  var header = document.getElementById('healthHeader');
  var chips = document.getElementById('healthChips');
  if (header && chips) {
    header.onclick = function() {
      chips.classList.toggle('open');
      header.querySelector('.health-arrow')?.classList.toggle('rotated');
    };
  }
}

export function updateBackButtonVisibility() {
  var btn = document.getElementById('backHomeBtn');
  if (!btn) return;
  var activePage = document.querySelector('.page.active');
  btn.style.display = activePage && activePage.id !== 'page-scan' ? 'flex' : 'none';
}

window.renderProfile = function() {
  var prof = lsGet('nl_profile') || {};
  window.profile = prof;
  updateSelectOptions();
  var elNombre = document.getElementById('pNombre');
  var elEdad = document.getElementById('pEdad');
  var elPeso = document.getElementById('pPeso');
  var elAltura = document.getElementById('pAltura');
  var elSexo = document.getElementById('pSexo');
  var elObjetivo = document.getElementById('pObjetivo');
  var elActividad = document.getElementById('pActividad');
  if (elNombre) elNombre.value = prof.nombre || '';
  if (elEdad) elEdad.value = prof.edad || '';
  if (elPeso) elPeso.value = prof.peso || '';
  if (elAltura) elAltura.value = prof.altura || '';
  if (elSexo) { elSexo.value = prof.sexo || 'm'; elSexo.classList.toggle('has-value', true); }
  if (elObjetivo) elObjetivo.value = prof.objetivo || 'mantener';
  if (elActividad) { elActividad.value = prof.actividad || '1.375'; elActividad.classList.toggle('has-value', true); }
  setupObjectivePills();
  updateHydrationDisplay();
  window.liveIMC();
  window.updateProfileHeader(prof.nombre || 'Usuario');
};

window.renderSettings = function() {
  var themeToggle = document.getElementById('themeToggleSettings');
  var notificationsToggle = document.getElementById('notificationsToggle');
  var proModeToggle = document.getElementById('proModeToggle');
  if (themeToggle) {
    themeToggle.classList.toggle('active', document.body.classList.contains('light'));
    themeToggle.onclick = function() { window.toggleTheme(); };
  }
  if (notificationsToggle) {
    var notifEnabled = localStorage.getItem('nl_notif') !== 'false';
    notificationsToggle.classList.toggle('active', notifEnabled);
    notificationsToggle.onclick = function() {
      var newState = !notificationsToggle.classList.contains('active');
      localStorage.setItem('nl_notif', newState ? 'true' : 'false');
      notificationsToggle.classList.toggle('active');
    };
  }
  if (proModeToggle) {
    proModeToggle.classList.toggle('active', isPro());
    proModeToggle.onclick = function() {
      if (window.plan.tier === 'free') { window.plan.tier = 'pro_monthly'; window.plan.expires = new Date(Date.now() + 30 * 86400000).toISOString(); }
      else { window.plan.tier = 'free'; window.plan.expires = null; }
      window.plan.since = new Date().toISOString();
      lsSet('nl_plan', window.plan);
      saveProfileToFS().catch(function() {});
      proModeToggle.classList.toggle('active');
      window.renderPlan();
      updateUsageUI();
      showToast(isPro() ? t('toastProActivated') : t('toastProDeactivated'));
    };
  }
};

window.showPremiumLock = function(feature, desc) {
  document.getElementById('premiumLockTitle').textContent = feature || 'Función Premium';
  document.getElementById('premiumLockDesc').textContent = desc || 'Esta función está disponible solo para usuarios Pro.';
  document.getElementById('modalPremiumLock').style.display = 'flex';
};

function showPlanDetails() {
  var content = document.getElementById('modalPlanDetailsContent');
  var isFree = window.plan.tier === 'free';
  var icon = isFree ? '🎯' : window.plan.tier === 'pro_annual' ? '💎' : '⚡';
  var color = isFree ? 'rgba(255,255,255,0.4)' : '#AAFF00';
  var expiresText = '';
  if (window.isAdmin) expiresText = 'Acceso completo · Admin';
  else if (window.plan.expires) expiresText = 'Expira: ' + new Date(window.plan.expires).toLocaleDateString();
  else if (!isFree) expiresText = 'Sin fecha de expiración';
  var benefits = !isFree
    ? ['Análisis ilimitados con IA', 'Coach nutricional IA 24/7', 'Plan de comidas semanal', 'Micronutrientes + índice glucémico', 'Exportar historial y reportes', 'Soporte prioritario']
    : ['5 análisis por mes', 'Macronutrientes básicos', 'Historial de 7 días', 'IMC y metas básicas'];
  var html = '<div class="plan-details-header"><div class="plan-icon">' + icon + '</div><h3 style="color:' + color + '">' + planTierName() + '</h3><div class="plan-tier">' + planLabel() + '</div><div class="plan-expires">' + expiresText + '</div></div>';
  html += '<div class="plan-details-section"><div class="plan-details-section-title">✅ ' + t('planIncludes') + '</div>';
  benefits.forEach(function(b) { html += '<div class="plan-details-benefit"><span class="check">✓</span> ' + b + '</div>'; });
  html += '</div>';
  if (isFree) {
    html += '<div style="text-align:center;padding:12px;margin-bottom:12px;background:rgba(170,255,0,0.05);border:1px solid rgba(170,255,0,0.1);border-radius:var(--radius-sm);"><div style="font-size:12px;color:var(--text-muted);margin-bottom:8px;">' + t('planUnlockMsg') + '</div><button class="premium-btn" onclick="closeModals();openModal()">' + t('planViewPlans') + '</button></div>';
  } else {
    html += '<div style="text-align:center;padding:12px;margin-bottom:12px;background:rgba(170,255,0,0.05);border:1px solid rgba(170,255,0,0.1);border-radius:var(--radius-sm);"><div style="font-size:12px;color:var(--accent);font-weight:700;">' + t('planEnjoyingMsg') + '</div></div>';
  }
  html += '<div style="display:flex;gap:10px;"><button class="premium-btn" style="flex:1;" onclick="closeModals();openModal()">' + t('planChangePlan') + '</button><button onclick="closeModals()" style="flex:1;background:transparent;border:1px solid var(--border);border-radius:var(--radius-sm);color:var(--text-muted);font-size:12px;font-weight:600;cursor:pointer;">' + t('planClose') + '</button></div>';
  content.innerHTML = html;
  document.getElementById('modalPlanDetails').style.display = 'flex';
}
window.showPlanDetails = showPlanDetails;
