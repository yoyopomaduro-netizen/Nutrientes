import { t, applyLanguage, currentLang, setLang } from './i18n.js';
import { lsGet, lsSet, getUsage } from './db.js';
import { FREE_LIMIT } from './config.js';

export function showToast(msg, dur) {
  dur = dur || 2400;
  const el = document.getElementById('toast');
  if (el) {
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(el._timer);
    el._timer = setTimeout(() => el.classList.remove('show'), dur);
  }
}

export function goToPage(page) {
  document.querySelectorAll('.page').forEach(function(p) { p.classList.remove('active'); });
  var target = document.getElementById('page-' + page);
  if (target) target.classList.add('active');
  var btn = document.getElementById('backHomeBtn');
  if (btn) btn.style.display = page === 'scan' ? 'none' : 'flex';
}

export function showSync(msg) {
  const el = document.getElementById('syncMsg');
  if (el) el.textContent = msg;
  document.getElementById('syncBar')?.classList.add('show');
}
export function hideSync() {
  document.getElementById('syncBar')?.classList.remove('show');
}

export function startScan() {
  document.getElementById('scanOverlay').style.display = 'flex';
  document.getElementById('scanSteps').style.display = 'none';
  showScanStep(0);
}
window.startScan = startScan;
export function stopScan() {
  document.getElementById('scanOverlay').style.display = 'none';
}
window.stopScan = stopScan;
function showScanStep(i) {
  const steps = document.querySelectorAll('.scan-step');
  steps.forEach(function(s, idx) {
    s.style.opacity = idx <= i ? '1' : '0.3';
  });
}

export function triggerConfetti() {
  var colors = ['#AAFF00','#50f0b8','#f0c050','#ff6b6b','#74b9ff','#a29bfe'];
  var s = document.createElement('style');
  s.textContent = '@keyframes confettiFall{to{transform:translateY(110vh) rotate(720deg);opacity:0}}';
  document.head.appendChild(s);
  for (var i = 0; i < 55; i++) {
    var c = document.createElement('div');
    c.style.cssText = 'position:fixed;width:' + (6 + Math.random()*8) + 'px;height:' + (6 + Math.random()*8) + 'px;background:' + colors[i % colors.length] + ';border-radius:' + (Math.random() > 0.5 ? '50%' : '2px') + ';top:-10px;left:' + Math.random() * 100 + 'vw;z-index:99999;animation:confettiFall ' + (2 + Math.random() * 2) + 's ease-in ' + (Math.random() * 0.8) + 's both;';
    document.body.appendChild(c);
    setTimeout(function() { c.remove(); }, 5000);
  }
}

export function updateUsageUI() {
  const used = getUsage();
  const isPro = window.isPro ? window.isPro() : false;
  const plan = window.plan || { tier: 'free' };
  const usageBarWrap = document.getElementById('usageBarWrap');
  const proBadge = document.getElementById('proBadge');
  const usageCount = document.getElementById('usageCount');
  const usageCircle = document.getElementById('usageCircle');
  const usageTotal = document.getElementById('usageTotal');
  const usageRemaining = document.getElementById('usageRemaining');
  const btnProSmall = document.getElementById('btnProSmall');
  const limit = FREE_LIMIT;
  if (isPro) {
    if (usageBarWrap) usageBarWrap.style.display = 'none';
    if (proBadge) proBadge.classList.add('show');
    var pc = document.getElementById('planLocked'); if(pc) pc.style.display = 'none';
    var pc2 = document.getElementById('planContent'); if(pc2) pc2.style.display = 'block';
    var pc3 = document.getElementById('coachLocked'); if(pc3) pc3.style.display = 'none';
    var pc4 = document.getElementById('coachChat'); if(pc4) { pc4.style.display = 'block'; if(window.restoreCoachHistory) window.restoreCoachHistory(); }
    var pc5 = document.getElementById('btnExportPDF'); if(pc5) pc5.style.display = 'inline-flex';
    var pc6 = document.getElementById('coachSection'); if(pc6) pc6.style.display = 'block';
    var pc7 = document.getElementById('microSection'); if(pc7) pc7.style.display = 'block';
    var pc8 = document.getElementById('metasCompare'); if(pc8) pc8.style.display = 'block';
    var pt = document.getElementById('proModeToggle'); if(pt) pt.classList.add('active');
    return;
  }
  if (usageBarWrap) usageBarWrap.style.display = 'grid';
  if (proBadge) proBadge.classList.remove('show');
  if (usageCount) usageCount.textContent = used;
  if (usageTotal) usageTotal.textContent = limit;
  if (usageRemaining) usageRemaining.textContent = used >= limit ? 'Límite alcanzado' : 'Te quedan ' + (limit - used) + ' análisis';
  if (usageCircle) {
    var r = parseFloat(usageCircle.getAttribute('r'));
    var c = 2 * Math.PI * r;
    var usedPct = Math.min(used / limit, 1);
    usageCircle.style.strokeDashoffset = c - (usedPct * c);
    usageCircle.setAttribute('stroke', used >= limit ? '#ff4444' : '#AAFF00');
  }
  if (btnProSmall) btnProSmall.style.display = used >= 3 ? 'block' : 'none';
  var cl = document.getElementById('coachLocked'); if(cl) cl.style.display = 'block';
  var cc = document.getElementById('coachChat'); if(cc) cc.style.display = 'none';
  var pl = document.getElementById('planLocked'); if(pl) pl.style.display = 'block';
  var pc = document.getElementById('planContent'); if(pc) pc.style.display = 'none';
  var be = document.getElementById('btnExportPDF'); if(be) be.style.display = 'none';
  var cs = document.getElementById('coachSection'); if(cs) cs.style.display = 'block';
  var ms = document.getElementById('microSection'); if(ms) ms.style.display = 'none';
  var mc = document.getElementById('metasCompare'); if(mc) mc.style.display = 'none';
  var pt = document.getElementById('proModeToggle'); if(pt) pt.classList.remove('active');
}

export function updateMotivations() {
  var ticker = document.getElementById('motivationTicker');
  if (!ticker) return;
  var motivs = t('motivaciones');
  if (Array.isArray(motivs)) {
    var idx = window.motivationIndex || 0;
    ticker.textContent = motivs[idx % motivs.length];
  }
  ticker.classList.add('visible');
}
export function rotateTicker() {
  var ticker = document.getElementById('motivationTicker');
  if (!ticker) return;
  var motivs = t('motivaciones');
  if (Array.isArray(motivs)) {
    ticker.classList.remove('visible');
    setTimeout(function() {
      if (window.motivationIndex === undefined) window.motivationIndex = 0;
      window.motivationIndex++;
      ticker.textContent = motivs[window.motivationIndex % motivs.length];
      ticker.classList.add('visible');
    }, 400);
  }
}

// Window exports for HTML onclick handlers
window.goToPage = goToPage;
window.showToast = showToast;
window.openModal = function() { document.getElementById('modalPro').style.display = 'flex'; };
window.closeModal = function() { document.getElementById('modalPro').style.display = 'none'; };
window.closeModals = function() {
  document.querySelectorAll('.modal-legal-overlay, .modal-overlay').forEach(function(m) {
    m.style.display = 'none';
  });
};
window.showModalTerms = function() { document.getElementById('modalTerms').style.display = 'flex'; };
window.showModalPrivacy = function() { document.getElementById('modalPrivacy').style.display = 'flex'; };
window.showModalContact = function() { document.getElementById('modalContact').style.display = 'flex'; };
window.toggleTheme = function() {
  document.body.classList.toggle('light');
  var fab = document.getElementById('themeFab');
  if (fab) fab.textContent = document.body.classList.contains('light') ? '🌙' : '☀️';
  localStorage.setItem('nl_theme', document.body.classList.contains('light') ? 'light' : 'dark');
};
window.acceptCookies = function() {
  var banner = document.getElementById('cookieBanner');
  if (banner) banner.style.display = 'none';
  localStorage.setItem('nl_cookies', 'accepted');
};
window.showSync = showSync;
window.hideSync = hideSync;
window.initMenu = initMenu;
window.restoreCoachHistory = null; // Will be set by coach.js

export function initMenu() {
  var dotsBtn = document.getElementById('menuDotsBtn');
  var dropdown = document.getElementById('menuDropdown');
  var langBtn = document.getElementById('langBtn');
  var langDropdown = document.getElementById('langDropdown');
  if (dotsBtn && dropdown) {
    dotsBtn.addEventListener('click', function(e) { e.stopPropagation(); dropdown.classList.toggle('open'); if (langDropdown) langDropdown.classList.remove('open'); });
  }
  if (langBtn && langDropdown) {
    langBtn.addEventListener('click', function(e) { e.stopPropagation(); langDropdown.classList.toggle('open'); if (dropdown) dropdown.classList.remove('open'); });
  }
  document.addEventListener('click', function() { if (dropdown) dropdown.classList.remove('open'); if (langDropdown) langDropdown.classList.remove('open'); });
  if (dropdown) {
    dropdown.addEventListener('click', function(e) {
      var item = e.target.closest('.menu-item');
      if (!item) return;
      var action = item.getAttribute('data-action');
      if (action) window.handleMenuAction(action);
    });
  }
  if (langDropdown) {
    langDropdown.addEventListener('click', function(e) {
      var opt = e.target.closest('.lang-option');
      if (!opt) return;
      var lang = opt.getAttribute('data-lang');
      if (!lang) return;
      import('./i18n.js').then(function(i18n) {
        i18n.setLang(lang);
        langDropdown.querySelectorAll('.lang-option').forEach(function(o) { o.classList.remove('active'); });
        opt.classList.add('active');
        var label = document.getElementById('langLabel');
        if (label) label.textContent = lang.toUpperCase();
        if (langDropdown) langDropdown.classList.remove('open');
        i18n.applyLanguage();
      });
    });
  }
}
window.initMenu = initMenu;
