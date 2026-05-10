import { t, currentLang } from './i18n.js';
import { lsGet, lsSet } from './db.js';
import { showToast } from './ui.js';
import { isPro } from './auth.js';
import { WORKER_URL } from './config.js';

window.generateWeeklyPlan = async function() {
  if (!isPro()) { if (window.showPremiumLock) window.showPremiumLock('Plan Semanal Personalizado', 'Genera un plan de comidas semanal adaptado a tus objetivos y preferencias.'); return; }
  var list = document.getElementById('weeklyPlanList');
  if (!list) return;
  list.innerHTML = '<div style="text-align:center;padding:24px;color:var(--text-muted)">⏳ Generando tu plan personalizado...</div>';
  try {
    var langName = { es:'español', en:'English', pt:'Português', fr:'Français', de:'Deutsch', it:'Italiano', ja:'日本語', zh:'中文', ar:'العربية', hi:'हिन्दी', ko:'한국어', ru:'Русский' }[currentLang] || 'español';
     var prompt = 'Crea un plan de comidas semanal en JSON para:\nNombre: ' + (window.profile.nombre || 'usuario') + '\nPeso: ' + (window.profile.peso || 70) + ' kg\nAltura: ' + (window.profile.altura || 170) + ' cm\nObjetivo: ' + (window.profile.objetivo === 'bajar' ? 'bajar de peso' : window.profile.objetivo === 'musculo' ? 'ganar músculo' : 'mantenerse') + '\nMeta calórica: ' + (window.metas.cal || 2000) + ' kcal/día\n\nEstructura EXACTA:\n{"days":[{"day":"Lunes","total_kcal":1800,"meals":[{"name":"Desayuno","food":"desc corta","kcal":0,"protein":0},{"name":"Almuerzo","food":"desc","kcal":0,"protein":0},{"name":"Merienda","food":"desc","kcal":0,"protein":0},{"name":"Cena","food":"desc","kcal":0,"protein":0}]}]}\n\nDevuelve SOLO el JSON. 7 días (Lunes a Domingo). Cada día 4 comidas. Descripciones cortas (<10 palabras). Total_kcal por día. Sin texto adicional, sin markdown, sin comas finales.';
    var res = await fetch(WORKER_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: [{ role: 'user', content: prompt }], max_tokens: 8192 }) });
    if (!res.ok) throw new Error('HTTP ' + res.status + ': ' + res.statusText);
    var data = await res.json();
    var raw = (data.text || data.content?.[0]?.text || '').trim();
    // Clean up markdown fences
    raw = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim();
    // Remove any text before the first { and after the last }
    var firstBrace = raw.indexOf('{');
    var lastBrace = raw.lastIndexOf('}');
    if (firstBrace === -1 || lastBrace === -1) throw new Error('No se encontró JSON válido');
    var jsonStr = raw.substring(firstBrace, lastBrace + 1);
    // Remove trailing commas (most common JSON error)
    jsonStr = jsonStr.replace(/,\s*([}\]])/g, '$1');
    // Try parsing, with progressive cleanup fallbacks
    var plan;
    try { plan = JSON.parse(jsonStr); } catch (e) {
      console.warn('JSON truncado, reparando...');
      // Remove any unclosed string after last quote
      var lastQuote = jsonStr.lastIndexOf('"');
      if (lastQuote > firstBrace && jsonStr.substring(lastQuote).split('"').length % 2 === 0) {
        jsonStr = jsonStr.substring(0, lastQuote + 1) + '"}]}';
      }
      jsonStr = jsonStr.replace(/,\s*([}\]])/g, '$1');
      try { plan = JSON.parse(jsonStr); } catch (e2) { plan = repairTruncatedPlan(jsonStr); }
    }
    if (!plan?.days || !Array.isArray(plan.days) || plan.days.length === 0) throw new Error('El JSON no contiene días válidos');
    lsSet('nl_weekly_plan', plan);
    displayWeeklyPlan(plan);
  } catch (err) {
    console.error('Error en generateWeeklyPlan:', err);
    list.innerHTML = '<div style="text-align:center;padding:24px;color:var(--error)">❌ Error: ' + err.message + '</div>';
  }
};

function repairTruncatedPlan(jsonStr) {
  var days = [];
  jsonStr = jsonStr.replace(/,\s*([}\]])/g, '$1');
  // Try extracting day objects even if deeply nested
  var dayRegex = /\{\s*"day"\s*:\s*"([^"]+)"\s*,\s*"total_kcal"\s*:\s*(\d+)\s*,\s*"meals"\s*:\s*(\[[\s\S]*?(?:\]|$))\s*\}/g;
  var match;
  while ((match = dayRegex.exec(jsonStr)) !== null) {
    var mealsStr = match[3];
    if (mealsStr.indexOf(']') === -1) mealsStr += ']';
    mealsStr = mealsStr.replace(/,\s*([}\]])/g, '$1');
    // Close any unclosed strings
    var mealsFixed = mealsStr.replace(/"food"\s*:\s*"([^"]*)$/g, '"food":"$1"');
    try { var meals = JSON.parse(mealsFixed); days.push({ day: match[1], total_kcal: parseInt(match[2]), meals: meals }); } catch (e) {
      // If meals fail, try saving at least the day with empty meals
      console.warn('Día ' + match[1] + ' con meals truncadas, usando vacío');
      days.push({ day: match[1], total_kcal: parseInt(match[2]) || 0, meals: [] });
    }
  }
  if (days.length === 0) {
    // Fallback: extract just day names
    dayRegex = /"day"\s*:\s*"([^"]+)"/g;
    while ((match = dayRegex.exec(jsonStr)) !== null) {
      days.push({ day: match[1], total_kcal: 0, meals: [] });
    }
  }
  if (days.length === 0) {
    // Last resort: extract any quoted strings that look like day names
    var dayNames = ['lunes','martes','miércoles','miercoles','jueves','viernes','sábado','sabado','domingo'];
    for (var di = 0; di < dayNames.length; di++) {
      if (jsonStr.toLowerCase().indexOf(dayNames[di]) !== -1) {
        days.push({ day: dayNames[di].charAt(0).toUpperCase() + dayNames[di].slice(1), total_kcal: 0, meals: [] });
      }
    }
  }
  if (days.length === 0) throw new Error('No se pudo reparar el JSON truncado');
  return { days: days };
}

window.displayWeeklyPlan = displayWeeklyPlan;
function displayWeeklyPlan(plan) {
  var list = document.getElementById('weeklyPlanList');
  if (!list || !plan?.days || !Array.isArray(plan.days) || plan.days.length === 0) return;
  var totalKcalWeek = plan.days.reduce(function(s, d) { return s + (d.total_kcal || 0); }, 0);
  var avgKcal = Math.round(totalKcalWeek / 7);
  var totalProteinWeek = plan.days.reduce(function(s, d) { return s + (d.meals?.reduce(function(sm, m) { return sm + (m.protein || 0); }, 0) || 0); }, 0);
  var avgProtein = Math.round(totalProteinWeek / 7);
  var scoreLetter = avgKcal <= window.metas.cal ? 'A' : avgKcal <= window.metas.cal * 1.1 ? 'B' : 'C';
  var scoreDesc = scoreLetter === 'A' ? 'Excelente, dentro de tu rango calórico' : scoreLetter === 'B' ? 'Bueno, ligeramente por encima' : 'Revisa porciones para ajustar a tu meta';
  var html = '<div class="weekly-plan-summary"><div class="weekly-plan-stat"><div class="weekly-plan-stat-val">' + avgKcal + '</div><div class="weekly-plan-stat-label">Promedio kcal/día</div></div><div class="weekly-plan-stat"><div class="weekly-plan-stat-val">' + avgProtein + 'g</div><div class="weekly-plan-stat-label">Proteína promedio</div></div><div class="weekly-plan-stat"><div class="weekly-plan-stat-val">' + plan.days.length + '</div><div class="weekly-plan-stat-label">Días planificados</div></div></div><div class="weekly-score-card"><div class="weekly-score-circle"><div class="weekly-score-letter">' + scoreLetter + '</div><div class="weekly-score-plus">+</div></div><div class="weekly-score-info"><div class="weekly-score-title">Puntuación nutricional</div><div class="weekly-score-desc">' + scoreDesc + '</div></div></div><div class="weekly-stats-row"><div class="weekly-stat-pill"><span class="weekly-stat-pill-icon">🔥</span><span class="weekly-stat-pill-text">Total semana:</span><span class="weekly-stat-pill-val">' + totalKcalWeek + ' kcal</span></div><div class="weekly-stat-pill"><span class="weekly-stat-pill-icon">💪</span><span class="weekly-stat-pill-text">Proteína total:</span><span class="weekly-stat-pill-val">' + totalProteinWeek + 'g</span></div></div>';
  for (var di = 0; di < plan.days.length; di++) {
    var day = plan.days[di];
    var dayKcal = day.total_kcal || 0;
    var percent = Math.min(Math.round((dayKcal / (window.metas.cal || 2000)) * 100), 100);
    var tip = dayKcal > (window.metas.cal || 2000) ? '⚠️ Día alto en calorías, reduce porciones en la cena' : dayKcal < (window.metas.cal || 2000) * 0.8 ? '✅ Día ligero, puedes añadir un snack saludable' : '👍 Dentro del rango ideal';
    html += '<div class="weekly-day"><div class="weekly-day-header" onclick="this.nextElementSibling.classList.toggle(\'open\'); this.querySelector(\'.weekly-day-arrow\').style.transform = this.nextElementSibling.classList.contains(\'open\') ? \'rotate(180deg)\' : \'\'"><div class="weekly-day-name">' + (day.day || 'Día ' + (di + 1)) + '</div><div class="weekly-day-right"><span class="weekly-day-kcal">' + dayKcal + ' kcal</span><span class="weekly-day-arrow">▼</span></div></div><div class="weekly-day-meals"><div class="weekly-cal-bar"><div class="weekly-cal-bar-fill" style="width:' + percent + '%; background:' + (percent > 100 ? '#ff5f5f' : '#b8f050') + '"></div></div>';
    if (day.meals) {
      for (var mi = 0; mi < day.meals.length; mi++) {
        var meal = day.meals[mi];
        var icon = meal.name === 'Desayuno' ? '🍳' : meal.name === 'Almuerzo' ? '🍲' : meal.name === 'Merienda' ? '🍎' : '🌙';
        html += '<div class="weekly-meal"><div class="weekly-meal-icon">' + icon + '</div><div class="weekly-meal-info"><div class="weekly-meal-name">' + (meal.name || '') + '</div><div class="weekly-meal-food">' + (meal.food || '') + '</div></div><div class="weekly-meal-macro"><div class="weekly-meal-kcal">' + (meal.kcal || 0) + ' kcal</div><div class="weekly-meal-prot">' + (meal.protein || 0) + 'g prot</div></div></div>';
      }
    }
    html += '<div class="weekly-day-tip">💡 ' + tip + '</div><div class="weekly-hydro">💧 Hidratación sugerida: ' + Math.round(dayKcal / 30) + ' ml de agua</div></div></div>';
  }
  html += '<button class="weekly-expand-btn" onclick="document.querySelectorAll(\'.weekly-day-meals\').forEach(m => m.classList.add(\'open\')); this.style.display=\'none\';">📋 Expandir todos los días</button>';
  list.innerHTML = html;
}

window.renderPlan = function() {
  var planLocked = document.getElementById('planLocked');
  var planContent = document.getElementById('planContent');
  if (planLocked && planContent) {
    if (isPro()) { planLocked.style.display = 'none'; planContent.style.display = 'block'; }
    else { planLocked.style.display = 'block'; planContent.style.display = 'none'; }
  }
  var savedPlan = lsGet('nl_weekly_plan', null) || lsGet('nl_coach_plan', null);
  if (savedPlan && savedPlan.days) displayWeeklyPlan(savedPlan);
};

window.clearHistory = async function() {
  if (!confirm('¿Borrar todo el historial?')) return;
  window.historyData = [];
  lsSet('nl_history', []);
  if (window.currentUser) {
    var { clearFSHistory } = await import('./db.js');
    clearFSHistory().catch(function() {});
  }
  if (window.updateMetasUI) window.updateMetasUI();
  if (window.renderHistory) window.renderHistory();
  showToast('🗑️ Historial eliminado');
};

window.exportPDF = function() {
  if (!isPro()) { if (window.showPremiumLock) window.showPremiumLock('Exportar Historial', 'Exporta tu historial nutricional para compartir con tu médico o nutriólogo.'); return; }
  var lines = ['NUTRILENT AI — HISTORIAL NUTRICIONAL', 'Exportado: ' + new Date().toLocaleString(), 'Usuario: ' + (window.profile.nombre || window.currentUser?.displayName || '—'), 'Objetivo: ' + (window.profile.objetivo || '—') + ' | Meta diaria: ' + window.metas.cal + ' kcal', 'Total de análisis: ' + window.historyData.length, ''].concat(window.historyData.slice(0, 40).map(function(e, i) {
    return [(i + 1) + '. ' + e.plato, '   Fecha: ' + e.date, '   Calorías: ' + e.calorias + ' kcal | Proteínas: ' + e.proteinas + 'g | Carbos: ' + e.carbos + 'g | Grasas: ' + e.grasas + 'g', e.consejo ? '   💡 ' + e.consejo : '', ''].join('\n');
  }));
  lines.push('───────────────────────────────', '© 2025 NutriLent AI · NutriLent® marca registrada', 'Los análisis son orientativos y no reemplazan asesoramiento médico.');
  var blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
  var a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'NutriLent_' + new Date().toISOString().split('T')[0] + '.txt';
  a.click();
  URL.revokeObjectURL(a.href);
  showToast('📄 Historial exportado');
};
