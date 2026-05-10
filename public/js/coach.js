import { t, currentLang } from './i18n.js';
import { lsGet, lsSet } from './db.js';
import { showToast } from './ui.js';
import { isPro } from './auth.js';
import { WORKER_URL } from './config.js';

function mdToHtml(text) {
  if (!text) return '';
  var html = text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
  html = html.replace(/\n/g, '<br>');
  return html;
}

function renderCoachReply(text, actionsHtml) {
  if (!text) return '';
  var safe = text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  // Step 1: Extract and render any JSON plan from the text
  var planHtml = '';
  // Try to extract JSON from ```plan blocks
  var planBlockMatch = safe.match(/```plan\s*([\s\S]*?)```/);
  var jsonStr = null;
  if (planBlockMatch) {
    jsonStr = planBlockMatch[1].trim();
    safe = safe.replace(/```plan[\s\S]*?```/, '');
  } else {
    // Try to find JSON by looking for {"days": or [{"day":
    var jsonMatch = safe.match(/\{[\s\S]*?"days"[\s\S]*?\}/);
    if (jsonMatch) jsonStr = jsonMatch[0];
    else {
      var altMatch = safe.match(/\[[\s\S]*?"day"[\s\S]*?\]/);
      if (altMatch) jsonStr = altMatch[0];
    }
  }
  if (jsonStr) {
    try { jsonStr = jsonStr.replace(/,\s*([}\]])/g, '$1'); var parsed = JSON.parse(jsonStr); planHtml = renderPlanJson(parsed); } catch (e) {
      try { var repaired = window.repairTruncatedPlan ? window.repairTruncatedPlan(jsonStr) : null; if (repaired && repaired.days) planHtml = renderPlanJson(repaired); } catch (e2) {}
    }
    // Remove the JSON text from safe
    safe = safe.replace(jsonStr, '');
  }
  // Step 2: Also find and render inline meal data like "Desayuno: text (500 kcal, 30g proteina)"
  safe = safe.replace(/(\bDesayuno|Almuerzo|Comida|Merienda|Cena|Snack|Breakfast|Lunch|Dinner)\s*[:]\s*([^(\n]*?)\s*\(?\s*(\d+)\s*kcal[^)]*\)?/gi, function(match, mealName, desc, kcal) {
    return '🍽️ ' + mealName + ': ' + desc.trim() + ' (' + kcal + ' kcal)';
  });
  // Step 3: Clean up any remaining JSON-like debris
  safe = safe.replace(/"\w+"\s*:\s*/g, '');
  safe = safe.replace(/["{}\[\]]/g, '');
  safe = safe.replace(/,\s*,/g, ',');
  safe = safe.replace(/^[\s,:\d.\-]+$/gm, '');
  // Step 4: Process remaining text into conversational HTML
  var lines = safe.split('\n');
  var html = '', inList = false;
  for (var i = 0; i < lines.length; i++) {
    var line = lines[i].trim();
    if (!line) { if (inList) { html += '</div>'; inList = false; } continue; }
    if (inList && !/^\d+\.\s/.test(line) && !/^[-•]\s/.test(line)) { html += '</div>'; inList = false; }
    if (/^###+\s/.test(line) || /^\*\*[^*]+\*\*$/.test(line)) {
      if (inList) { html += '</div>'; inList = false; }
      var title = line.replace(/^#+\s*/, '').replace(/^\*\*|\*\*$/g, '');
      var icon = '📋';
      if (/nutrición|calorías|macros|proteína|grasas|carbos|nutrition/i.test(title)) icon = '🔢';
      else if (/tip|consejo|recomendación|sugerencia|advice|recommendation/i.test(title)) icon = '✅';
      html += '<div class="coach-section-card"><div class="coach-section-card-title">' + icon + ' ' + title + '</div>'; continue;
    }
    if (/^\d+\.\s/.test(line)) {
      if (!inList) { html += '<div style="margin:6px 0;">'; inList = true; }
      html += '<div class="coach-list-item"><span class="bullet">•</span> ' + mdToHtml(line.replace(/^\d+\.\s*/, '')) + '</div>'; continue;
    }
    if (/^[-•]\s/.test(line)) {
      if (!inList) { html += '<div style="margin:6px 0;">'; inList = true; }
      html += '<div class="coach-list-item"><span class="bullet">•</span> ' + mdToHtml(line.replace(/^[-•]\s*/, '')) + '</div>'; continue;
    }
    html += '<div style="margin:4px 0;">' + mdToHtml(line) + '</div>';
  }
  if (inList) html += '</div>';
  // Step 5: Assemble plan HTML first, then conversational HTML, then action buttons
  var result = '';
  if (planHtml) result += planHtml;
  if (html.trim()) result += html;
  if (actionsHtml) result += actionsHtml;
  return result || '<div style="margin:4px 0;">' + safe.replace(/\n/g, '<br>') + '</div>';
}

function renderPlanJson(plan) {
  if (!plan || !plan.days || !Array.isArray(plan.days) || plan.days.length === 0) return '';
  var totalKcal = plan.days.reduce(function(s, d) { return s + (d.total_kcal || 0); }, 0);
  var html = '<div style="margin:6px 0 10px;"><div style="font-family:var(--font-display);font-size:13px;font-weight:700;color:var(--text);margin-bottom:10px;">📅 Plan Semanal · ' + totalKcal + ' kcal</div>';
  // Summary pills
  html += '<div style="display:flex;gap:6px;margin-bottom:10px;flex-wrap:wrap;">';
  html += '<span style="background:var(--surface3);border:1px solid var(--border);border-radius:20px;padding:4px 10px;font-size:10px;color:var(--text-muted);">🔥 ' + totalKcal + ' kcal totales</span>';
  html += '<span style="background:var(--surface3);border:1px solid var(--border);border-radius:20px;padding:4px 10px;font-size:10px;color:var(--text-muted);">📅 ' + plan.days.length + ' días</span>';
  var avgKcal = Math.round(totalKcal / plan.days.length);
  html += '<span style="background:var(--surface3);border:1px solid var(--border);border-radius:20px;padding:4px 10px;font-size:10px;color:var(--text-muted);">📊 ' + avgKcal + ' kcal/día promedio</span>';
  html += '</div>';
  // Day cards
  for (var di = 0; di < plan.days.length; di++) {
    var day = plan.days[di];
    var dayKcal = day.total_kcal || 0;
    var dayId = 'planDay' + di + '_' + Date.now();
    html += '<div class="coach-plan-day">';
    html += '<div class="coach-plan-day-header" onclick="document.getElementById(\'' + dayId + '\').classList.toggle(\'open\'); this.classList.toggle(\'open\');">';
    html += '<span class="day-name">📅 ' + (day.day || 'Día ' + (di + 1)) + '</span>';
    html += '<span style="display:flex;align-items:center;gap:8px;"><span class="day-kcal">' + dayKcal + ' kcal</span><span class="day-arrow">▼</span></span>';
    html += '</div>';
    html += '<div class="coach-plan-day-meals" id="' + dayId + '">';
    if (day.meals && day.meals.length > 0) {
      for (var mi = 0; mi < day.meals.length; mi++) {
        var meal = day.meals[mi];
        var mIcon = '🌙';
        var mName = (meal.name || '').toLowerCase();
        if (mName.indexOf('desayuno') !== -1 || mName.indexOf('breakfast') !== -1) mIcon = '🌅';
        else if (mName.indexOf('almuerzo') !== -1 || mName.indexOf('lunch') !== -1 || mName.indexOf('comida') !== -1) mIcon = '☀️';
        else if (mName.indexOf('merienda') !== -1 || mName.indexOf('snack') !== -1) mIcon = '🍎';
        else if (mName.indexOf('cena') !== -1 || mName.indexOf('dinner') !== -1) mIcon = '🌙';
        html += '<div class="coach-plan-meal">';
        html += '<div class="coach-plan-meal-icon">' + mIcon + '</div>';
        html += '<div class="coach-plan-meal-info">';
        html += '<div class="coach-plan-meal-name">' + (meal.name || 'Comida') + '</div>';
        html += '<div class="coach-plan-meal-desc">' + (meal.food || '') + '</div>';
        html += '<div class="coach-plan-meal-macros">' + (meal.kcal ? '<strong>' + meal.kcal + ' kcal</strong>' : '') + (meal.protein ? ' · <strong>' + meal.protein + 'g</strong> proteína' : '') + '</div>';
        html += '</div></div>';
      }
    } else {
      html += '<div style="font-size:11px;color:var(--text-muted);padding:4px 0;">Sin comidas registradas</div>';
    }
    html += '</div></div>';
  }
  html += '</div>';
  return html;
}

function generateCoachActions(reply, hasPlan) {
  var actions = [], lower = reply.toLowerCase();
  if (hasPlan || /plan|semanal|lunes|martes|miércoles|desayuno|almuerzo|cena/i.test(lower)) {
    actions.push({ label: t('coachActionPlan'), sug: 'Cambia el desayuno del plan' });
    actions.push({ label: t('coachActionProtein'), sug: 'Aumenta la proteína en mi plan semanal' });
    actions.push({ label: t('coachActionCalories'), sug: 'Reduce las calorías de mi plan semanal' });
    actions.push({ label: t('coachActionLike'), sug: 'Me gusta este plan, guárdalo' });
  } else if (/comida|plato|receta|ingrediente|alimento/i.test(lower)) {
    actions.push({ label: t('coachActionRegister'), sug: 'Ayúdame a registrar esta comida' });
    actions.push({ label: t('coachActionAlternatives'), sug: 'Dame opciones alternativas más saludables' });
    actions.push({ label: t('coachActionCanEat'), sug: '¿Puedo comer esto con mis metas?' });
  } else if (/tip|consejo|recomendación|debería|puedo/i.test(lower)) {
    actions.push({ label: t('coachActionMoreInfo'), sug: 'Dame más información sobre este tema' });
    actions.push({ label: t('coachActionApply'), sug: 'Aplica este consejo a mi plan semanal' });
    actions.push({ label: t('coachActionOtherTip'), sug: 'Dame otro consejo nutricional' });
  } else {
    actions.push({ label: t('coachActionMotivation'), sug: 'Dame un tip motivacional para hoy' });
    actions.push({ label: t('coachActionMeal'), sug: 'Recomiéndame una comida saludable' });
    actions.push({ label: t('coachActionProgress'), sug: 'Cómo voy con mis metas nutricionales' });
  }
  var html = '<div class="coach-actions">';
  actions.forEach(function(a) { html += '<button class="coach-action-btn" onclick="sendSuggestion(\'' + a.sug.replace(/'/g,"\\'") + '\')">' + a.label + '</button>'; });
  return html + '</div>';
}

export function saveCoachHistory() {
  var msgs = [];
  document.querySelectorAll('#coachMessages .coach-msg').forEach(function(el) {
    var bubble = el.querySelector('.coach-bubble');
    if (bubble) msgs.push({ role: el.classList.contains('user') ? 'user' : 'coach', text: bubble.innerText });
  });
  lsSet('nl_coach_history', msgs.slice(-20));
}

export function restoreCoachHistory() {
  var saved = lsGet('nl_coach_history', []);
  var container = document.getElementById('coachMessages');
  if (!container || saved.length === 0) return;
  container.innerHTML = '';
  saved.forEach(function(m) {
    var div = document.createElement('div');
    div.className = 'coach-msg' + (m.role === 'user' ? ' user' : '');
    var avatarHtml = m.role === 'coach' ? '<div class="coach-msg-avatar coach">🤖</div>' : '<div class="coach-msg-avatar user">👤</div>';
    div.innerHTML = avatarHtml + '<div class="coach-bubble">' + (m.role === 'coach' ? renderCoachReply(m.text) : mdToHtml(m.text)) + '</div>';
    container.appendChild(div);
  });
  container.scrollTop = container.scrollHeight;
}

window.sendCoachMsg = async function() {
  if (!isPro()) { if (window.showPremiumLock) window.showPremiumLock('Coach Nutricional IA', 'Habla con un coach IA 24/7 sobre nutrición, alimentación y tus metas.'); return; }
  var input = document.getElementById('coachInput');
  var msg = input?.value.trim();
  if (!msg) return;
  var container = document.getElementById('coachMessages');
  if (!container) return;
  var userDiv = document.createElement('div');
  userDiv.className = 'coach-msg user';
  userDiv.innerHTML = '<div class="coach-msg-avatar user">👤</div><div class="coach-bubble">' + msg.replace(/</g,'&lt;').replace(/>/g,'&gt;') + '</div>';
  container.appendChild(userDiv);
  if (input) input.value = '';
  container.scrollTop = container.scrollHeight;
  saveCoachHistory();
  var typingEl = document.createElement('div');
  typingEl.className = 'coach-typing';
  typingEl.innerHTML = '<span></span><span></span><span></span>';
  container.appendChild(typingEl);
  container.scrollTop = container.scrollHeight;
  try {
    var langName = { es:'español', en:'English', pt:'Português', fr:'Français', de:'Deutsch', it:'Italiano', ja:'日本語', zh:'中文', ar:'العربية', hi:'हिन्दी', ko:'한국어', ru:'Русский' }[currentLang] || 'español';
    var historyMsgs = [];
    document.querySelectorAll('#coachMessages .coach-msg').forEach(function(el) {
      if (el === typingEl || el === userDiv) return;
      var bubble = el.querySelector('.coach-bubble');
      if (bubble) historyMsgs.push({ role: el.classList.contains('user') ? 'user' : 'assistant', content: bubble.innerText });
    });
    var savedPlan = lsGet('nl_weekly_plan', null) || lsGet('nl_coach_plan', null);
    var perfil_lines = [
      'Nombre: ' + (window.profile.nombre || 'No especificado'),
      'Edad: ' + (window.profile.edad || '?') + ' años',
      'Sexo: ' + (window.profile.sexo === 'm' ? 'Masculino' : 'Femenino'),
      'Peso: ' + (window.profile.peso || '?') + ' kg',
      'Altura: ' + (window.profile.altura || '?') + ' cm',
      'Objetivo: ' + (window.profile.objetivo === 'bajar' ? 'bajar de peso' : window.profile.objetivo === 'musculo' ? 'ganar músculo' : 'mantenerse'),
      'Meta calórica: ' + (window.metas.cal || 2000) + ' kcal/día',
      'Condiciones de salud: ' + (window.selectedConditions.length > 0 ? window.selectedConditions.join(', ') : 'ninguna')
    ];
    var planContext = savedPlan?.days ? '\n\nPLAN SEMANAL ACTUAL:\n' + JSON.stringify(savedPlan, null, 2) + '\n\nSi el usuario pide modificarlo, genera NUEVO JSON entre ```plan ... ```.' : '';
    var needsPlanUpdate = /plan|men[úu]|comida|cambiar|modificar|no me gusta|prefiero|reemplazar|cena|desayuno|almuerzo|hambre|antojo|no como|rechazo|reempla.z|reemplaza/i.test(msg);
    var systemMsg = 'Eres un coach nutricional cálido y conversacional. Responde en ' + langName + '.\n\nREGLAS ESTRICTAS:\n- NUNCA incluyas JSON, llaves {}, corchetes [] ni código en tu respuesta visible.\n- Si necesitas generar un plan, pon TODO el JSON DENTRO de ```plan ... ``` exclusivamente.\n- FUERA de las marcas ```plan, usa SOLO texto natural, listas con - y títulos con ###.\n- Habla como un amigo experto, cercano y alentador.\n- **Negritas** solo para cifras importantes.\n- Separa secciones con ### títulos.';
    if (needsPlanUpdate) systemMsg += '\n\nMUY IMPORTANTE: El usuario quiere MODIFICAR su plan. Genera el NUEVO PLAN COMPLETO en formato JSON EXCLUSIVAMENTE dentro de ```plan ... ``` tags. NADA DE JSON fuera de esas marcas.';
    systemMsg += '\n\nPerfil:\n' + perfil_lines.join('\n') + planContext;
    var messages = [{ role: 'system', content: systemMsg }];
    historyMsgs.slice(-10).forEach(function(m) { messages.push(m); });
    messages.push({ role: 'user', content: msg });
    var res = await fetch(WORKER_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: messages, max_tokens: 4096 }) });
    var data = await res.json();
    typingEl.remove();
    var reply = data.text?.trim() || 'Lo siento, no pude responder.';
    var planJson = null, planMatch = reply.match(/```plan\s*([\s\S]*?)```/);
    if (planMatch) {
      try { planJson = JSON.parse(planMatch[1].trim()); } catch (e) { try { planJson = window.repairTruncatedPlan(planMatch[1]); } catch (e2) {} }
      reply = reply.replace(/```plan[\s\S]*?```/, '').trim();
    }
    var actionsHtml = generateCoachActions(reply, !!(planJson && planJson.days));
    var aiDiv = document.createElement('div');
    aiDiv.className = 'coach-msg';
    aiDiv.innerHTML = '<div class="coach-msg-avatar coach">🤖</div><div class="coach-bubble">' + renderCoachReply(reply, actionsHtml) + '</div>';
    container.appendChild(aiDiv);
    if (planJson && planJson.days && Array.isArray(planJson.days) && planJson.days.length > 0) {
      var updateDiv = document.createElement('div');
      updateDiv.className = 'coach-plan-update';
      var diffHtml = planJson.days.slice(0, 3).map(function(d) {
        return '<div class="coach-plan-update-diff">📅 ' + d.day + ': ' + (d.meals || []).map(function(m) { return m.food || ''; }).filter(Boolean).join(' · ') + '</div>';
      }).join('');
      updateDiv.innerHTML = '<div class="coach-plan-update-title">✅ Plan actualizado</div>' + diffHtml + '<div style="font-size:10px;color:var(--text-muted);margin-top:6px;">' + planJson.days.reduce(function(s, d) { return s + (d.total_kcal || 0); }, 0) + ' kcal totales en ' + planJson.days.length + ' días</div>';
      container.appendChild(updateDiv);
      lsSet('nl_coach_plan', planJson);
      lsSet('nl_weekly_plan', planJson);
      if (window.displayWeeklyPlan) window.displayWeeklyPlan(planJson);
      showToast(t('toastPlanUpdated'));
    }
    container.scrollTop = container.scrollHeight;
    saveCoachHistory();
  } catch (err) {
    typingEl.remove();
    var errDiv = document.createElement('div');
    errDiv.className = 'coach-msg';
    errDiv.innerHTML = '<div class="coach-msg-avatar coach">🤖</div><div class="coach-bubble"><div class="coach-tip-box">❌ Error de conexión. Intenta de nuevo.</div></div>';
    container.appendChild(errDiv);
    container.scrollTop = container.scrollHeight;
  }
};

window.sendSuggestion = function(text) {
  var input = document.getElementById('coachInput');
  if (input) input.value = text;
  window.sendCoachMsg();
};

window.restoreCoachHistory = restoreCoachHistory;
