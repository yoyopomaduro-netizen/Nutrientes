import { t, currentLang } from './i18n.js';
import { lsGet, lsSet, setText } from './db.js';
import { showToast } from './ui.js';
import { updateMetasUI } from './nutrition.js';
import { WORKER_URL } from './config.js';

export function updateStreak() {
  var today = new Date().toDateString();
  var lastDate = localStorage.getItem('nl_last_analysis_date');
  var streak = parseInt(localStorage.getItem('nl_streak') || '0');
  if (lastDate === today) return streak;
  var yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
  if (lastDate === yesterday.toDateString()) streak++;
  else streak = 1;
  localStorage.setItem('nl_streak', streak);
  localStorage.setItem('nl_last_analysis_date', today);
  var streakNum = document.getElementById('streakNum');
  if (streakNum) streakNum.innerText = streak;
  var dotsContainer = document.getElementById('streakDots');
  if (dotsContainer) {
    var dots = [];
    for (var i = 6; i >= 0; i--) {
      var d = new Date(); d.setDate(d.getDate() - i);
      var dateStr = d.toDateString();
      var hasAnalysis = window.historyData.some(function(e) { return new Date(e.id).toDateString() === dateStr; });
      var isToday = i === 0;
      var dotClass = 'streak-dot';
      if (hasAnalysis) dotClass += ' active';
      if (isToday && hasAnalysis) dotClass += ' today';
      dots.push('<div class="' + dotClass + '"></div>');
    }
    dotsContainer.innerHTML = dots.join('');
  }
  return streak;
}

export function renderWeeklyMacrosChart() {
  var wrap = document.querySelector('.macro-stats-wrap');
  if (!wrap) return;
  var last7Days = Array.from({ length: 7 }, function(_, i) { var d = new Date(); d.setDate(d.getDate() - (6 - i)); return d.toDateString(); });
  var totals = last7Days.map(function(date) {
    var entries = window.historyData.filter(function(e) { return new Date(e.id).toDateString() === date; });
    return {
      protein: entries.reduce(function(s, e) { return s + (e.proteinas || 0); }, 0),
      carbs: entries.reduce(function(s, e) { return s + (e.carbos || 0); }, 0),
      fats: entries.reduce(function(s, e) { return s + (e.grasas || 0); }, 0)
    };
  });
  var protTotal = Math.round(totals.reduce(function(s, d) { return s + d.protein; }, 0));
  var carbTotal = Math.round(totals.reduce(function(s, d) { return s + d.carbs; }, 0));
  var fatTotal = Math.round(totals.reduce(function(s, d) { return s + d.fats; }, 0));
  var daysWithData = totals.filter(function(d) { return d.protein + d.carbs + d.fats > 0; }).length || 1;
  setText('macroProtTotal', protTotal + 'g');
  setText('macroCarbTotal', carbTotal + 'g');
  setText('macroFatTotal', fatTotal + 'g');
  setText('macroProtAvg', Math.round(protTotal / daysWithData) + 'g/día');
  setText('macroCarbAvg', Math.round(carbTotal / daysWithData) + 'g/día');
  setText('macroFatAvg', Math.round(fatTotal / daysWithData) + 'g/día');
  wrap.style.display = 'block';
}

export async function generateWeeklyReport() {
  var today = new Date();
  if (today.getDay() !== 0) return;
  var lastReport = localStorage.getItem('nl_last_weekly_report');
  var thisWeekStart = new Date(); thisWeekStart.setDate(today.getDate() - today.getDay());
  if (lastReport === thisWeekStart.toDateString()) return;
  var weekEntries = window.historyData.filter(function(e) { var d = new Date(e.id); return d >= thisWeekStart && d <= today; });
  if (weekEntries.length === 0) return;
  var avgCal = weekEntries.reduce(function(s, e) { return s + e.calorias; }, 0) / weekEntries.length;
  var langName = { es:'español', en:'English', pt:'Português' }[currentLang] || 'español';
  try {
    var res = await fetch(WORKER_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: [{ role: 'user', content: 'Genera un resumen semanal de nutrición en ' + langName + ' (máximo 40 palabras) basado en: promedio calórico diario: ' + Math.round(avgCal) + ' kcal, objetivo del usuario: ' + (window.profile.objetivo || 'mantener') + '. Sé motivador y da un consejo práctico.' }] }) });
    var data = await res.json();
    var report = data.text?.trim() || 'Sigue así, cada día cuenta.';
    localStorage.setItem('nl_last_weekly_report', thisWeekStart.toDateString());
    var reportDiv = document.getElementById('weeklyAISummaryText');
    if (reportDiv) { reportDiv.innerHTML = report; setText('weeklyAISummaryDate', today.toLocaleDateString()); document.querySelector('.weekly-ai-summary-card').style.display = 'block'; }
  } catch (err) { console.warn('Error generando reporte semanal:', err); }
}

export function renderMonthComparison() {
  var months = {};
  window.historyData.forEach(function(entry) {
    var d = new Date(entry.id);
    var key = d.getFullYear() + '-' + d.getMonth();
    if (!months[key]) months[key] = { total: 0, count: 0 };
    months[key].total += entry.calorias;
    months[key].count++;
  });
  var monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  var monthKeys = Object.keys(months).sort();
  if (monthKeys.length < 2) { document.querySelector('.month-compare-card').style.display = 'none'; return; }
  var lastTwo = monthKeys.slice(-2);
  var firstAvg = Math.round(months[lastTwo[0]].total / months[lastTwo[0]].count);
  var secondAvg = Math.round(months[lastTwo[1]].total / months[lastTwo[1]].count);
  var maxVal = Math.max(firstAvg, secondAvg, 1);
  setText('monthLabel1', monthNames[parseInt(lastTwo[0].split('-')[1])]);
  setText('monthLabel2', monthNames[parseInt(lastTwo[1].split('-')[1])]);
  setText('monthVal1', String(firstAvg));
  setText('monthVal2', String(secondAvg));
  if (document.getElementById('monthBar1')) document.getElementById('monthBar1').style.width = (firstAvg / maxVal * 100) + '%';
  if (document.getElementById('monthBar2')) document.getElementById('monthBar2').style.width = (secondAvg / maxVal * 100) + '%';
  document.querySelector('.month-compare-card').style.display = 'block';
}

export function renderHistory() {
  var list = document.getElementById('historyList');
  var chartWrp = document.getElementById('chartWrap');
  if (!window.historyData.length) {
    if (chartWrp) chartWrp.style.display = 'none';
    if (list) list.innerHTML = '<div class="history-empty"><div class="history-empty-icon">🍽️</div>Sin análisis aún — ¡sube tu primera comida!</div>';
    return;
  }
  if (chartWrp) chartWrp.style.display = 'block';
  var today = new Date();
  var days = Array.from({ length: 7 }, function(_, i) {
    var d = new Date(today);
    d.setDate(today.getDate() - (6 - i));
    var total = window.historyData.filter(function(e) { return new Date(e.id).toDateString() === d.toDateString(); }).reduce(function(s, e) { return s + (e.calorias || 0); }, 0);
    return { label: i === 6 ? 'hoy' : d.toLocaleDateString('es-CO', { weekday: 'short' }).slice(0, 3), total: total, isToday: i === 6 };
  });
  var maxVal = Math.max(...days.map(function(d) { return d.total; }), window.metas.cal, 1);
  var bars = document.getElementById('chartBars');
  if (bars) {
    bars.innerHTML = days.map(function(d) {
      return '<div class="chart-bar-wrap"><div class="chart-bar' + (d.isToday ? ' today' : '') + '" style="height:' + (d.total > 0 ? Math.max((d.total / maxVal) * 80, 6) : 4) + 'px"></div><div class="chart-day">' + d.label + '</div>' + (d.total > 0 ? '<div class="chart-kcal">' + d.total + '</div>' : '') + '</div>';
    }).join('');
  }
  if (list) {
    list.innerHTML = window.historyData.map(function(entry) {
      return '<div class="history-item" onclick="window.showHistoryDetail(' + entry.id + ')"><img class="history-thumb" src="' + (entry.img || '') + '" onerror="this.style.display=\'none\'"><div style="flex:1;min-width:0"><div class="history-dish">' + (entry.plato || '—') + '</div><div class="history-meta">' + entry.date + ' · 🥩' + entry.proteinas + 'g 🌾' + entry.carbos + 'g</div></div><div class="history-kcal">' + entry.calorias + '<span>kcal</span></div></div>';
    }).join('');
  }
}
window.renderHistory = renderHistory;

window.showHistoryDetail = function(id) {
  var entry = window.historyData.find(function(e) { return e.id === id; });
  if (entry) { window.lastAnalysis = entry; window.showResult(entry); goToPage('scan'); }
};

window.getAISummary = async function() {
  if (!window.lastAnalysis) return;
  var card = document.getElementById('aiSummaryCard');
  var txtEl = document.getElementById('aiSummaryText');
  if (card) card.style.display = 'block';
  if (txtEl) txtEl.textContent = '⏳ Generando recomendación...';
  try {
    var langName = { es:'español', en:'English', pt:'Português', fr:'Français', de:'Deutsch', it:'Italiano', ja:'日本語', zh:'中文', ar:'العربية', hi:'हिन्दी', ko:'한국어', ru:'Русский' }[currentLang] || 'español';
    var res = await fetch(WORKER_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: [{ role: 'user', content: 'Eres un nutricionista experto. Basado en este análisis: ' + window.lastAnalysis.plato + ' (' + window.lastAnalysis.calorias + ' kcal, ' + window.lastAnalysis.proteinas + 'g proteína, ' + window.lastAnalysis.carbos + 'g carbos, ' + window.lastAnalysis.grasas + 'g grasas). Perfil del usuario: ' + (window.profile.objetivo || 'mantener peso') + ', ' + (window.profile.peso || '70') + 'kg. Genera una recomendación nutricional personalizada en ' + langName + ' de 3-4 oraciones. Incluye un tip práctico y motivador.' }] }) });
    var data = await res.json();
    if (txtEl) txtEl.textContent = data.text?.trim() || 'No se pudo generar la recomendación.';
  } catch (err) { if (txtEl) txtEl.textContent = 'Error al conectar con la IA.'; }
};

window.updateStreak = updateStreak;
window.renderWeeklyMacrosChart = renderWeeklyMacrosChart;
window.renderMonthComparison = renderMonthComparison;
window.generateWeeklyReport = generateWeeklyReport;
