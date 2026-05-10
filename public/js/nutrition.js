import { t, currentLang } from './i18n.js';
import { lsGet, lsSet, setText, getUsage, incUsage, checkLimit } from './db.js';
import { showToast, triggerConfetti, updateUsageUI } from './ui.js';
import { isPro } from './auth.js';
import { WORKER_URL } from './config.js';

// Global state shared via window
window.metas = { cal: 2000, prot: 150, carbs: 200, fats: 55 };
window.profile = {};
window.historyData = [];
window.selectedConditions = lsGet('nl_conditions', []);
window.lastAnalysis = null;
window._confettiToday = null;

function updateCircle(id, pct, color) {
  var el = document.getElementById(id);
  if (!el) return;
  var r = parseFloat(el.getAttribute('r'));
  var c = 2 * Math.PI * r;
  var offset = c - (Math.min(pct, 100) / 100 * c);
  el.style.strokeDashoffset = offset;
  if (color) el.setAttribute('stroke', color);
}

function getPctColor(pct) {
  if (pct >= 80) return '#ff4444';
  if (pct >= 50) return '#f0c050';
  return '#AAFF00';
}

export function updateMetasUI() {
  var todayStr = new Date().toDateString();
  var todayEntries = window.historyData.filter(function(e) { return new Date(e.id).toDateString() === todayStr; });
  var tCal = todayEntries.reduce(function(s, e) { return s + (e.calorias || 0); }, 0);
  var tProt = todayEntries.reduce(function(s, e) { return s + (e.proteinas || 0); }, 0);
  var tCarbs = todayEntries.reduce(function(s, e) { return s + (e.carbos || 0); }, 0);
  var tFats = todayEntries.reduce(function(s, e) { return s + (e.grasas || 0); }, 0);
  var pCal = window.metas.cal ? Math.min(Math.round(tCal / window.metas.cal * 100), 150) : 0;
  var pProt = window.metas.prot ? Math.min(Math.round(tProt / window.metas.prot * 100), 150) : 0;
  var pCarbs = window.metas.carbs ? Math.min(Math.round(tCarbs / window.metas.carbs * 100), 150) : 0;
  var pFats = window.metas.fats ? Math.min(Math.round(tFats / window.metas.fats * 100), 150) : 0;
  setText('totalCal', tCal);
  setText('totalProt', tProt);
  setText('totalCarbs', tCarbs);
  setText('totalFats', tFats);
  setText('goalCalShow', window.metas.cal || 2000);
  setText('goalProtShow', window.metas.prot || 150);
  setText('goalCarbsShow', window.metas.carbs || 200);
  setText('goalFatsShow', window.metas.fats || 55);
  setText('pctCal', pCal + '%');
  setText('pctProt', pProt + '%');
  setText('pctCarbs', pCarbs + '%');
  setText('pctFats', pFats + '%');
  updateCircle('circleCal', pCal, getPctColor(pCal));
  updateCircle('circleProt', pProt, getPctColor(pProt));
  updateCircle('circleCarbs', pCarbs, getPctColor(pCarbs));
  updateCircle('circleFats', pFats, getPctColor(pFats));
  var calPctEl = document.getElementById('pctCal');
  if (calPctEl) calPctEl.style.color = getPctColor(pCal);
  var protPctEl = document.getElementById('pctProt');
  if (protPctEl) protPctEl.style.color = getPctColor(pProt);
  var carbsPctEl = document.getElementById('pctCarbs');
  if (carbsPctEl) carbsPctEl.style.color = getPctColor(pCarbs);
  var fatsPctEl = document.getElementById('pctFats');
  if (fatsPctEl) fatsPctEl.style.color = getPctColor(pFats);
  if (pCal >= 100 && !window._confettiToday) {
    window._confettiToday = todayStr;
    triggerConfetti();
    showToast(t('toastMetaReached'), 3000);
  }
}

export function updateSelectOptions() {
  var sexoSelect = document.getElementById('pSexo');
  if (sexoSelect) {
    sexoSelect.innerHTML = '<option value="m">' + t('sexoMasc') + '</option><option value="f">' + t('sexoFem') + '</option>';
    if (window.profile.sexo) sexoSelect.value = window.profile.sexo;
    sexoSelect.classList.toggle('has-value', !!sexoSelect.value);
  }
  var objetivoSelect = document.getElementById('pObjetivo');
  if (objetivoSelect) {
    objetivoSelect.innerHTML = '<option value="bajar">' + t('objetivoBajar') + '</option><option value="musculo">' + t('objetivoMusculo') + '</option><option value="mantener">' + t('objetivoMantener') + '</option>';
    if (window.profile.objetivo) objetivoSelect.value = window.profile.objetivo;
    objetivoSelect.classList.toggle('has-value', !!objetivoSelect.value);
  }
  var actividadSelect = document.getElementById('pActividad');
  if (actividadSelect) {
    actividadSelect.innerHTML = '<option value="1.1">' + t('actividad1_1') + '</option><option value="1.2">' + t('actividad1_2') + '</option><option value="1.375">' + t('actividad1_375') + '</option><option value="1.5">' + t('actividad1_5') + '</option><option value="1.7">' + t('actividad1_7') + '</option><option value="1.9">' + t('actividad1_9') + '</option>';
    if (window.profile.actividad) actividadSelect.value = window.profile.actividad;
    actividadSelect.classList.toggle('has-value', !!actividadSelect.value);
  }
}

export function detectAllergens(ingredients) {
  var terms = t('alergenos') || [];
  var found = [];
  if (!Array.isArray(terms)) return found;
  (ingredients || []).forEach(function(ing) {
    terms.forEach(function(term) {
      if (ing.toLowerCase().includes(term.toLowerCase()) && !found.includes(term)) found.push(term);
    });
  });
  return found;
}

export function showAllergens(allergens) {
  var container = document.getElementById('allergenContainer');
  if (!container) return;
  if (!allergens || allergens.length === 0) { container.style.display = 'none'; return; }
  container.style.display = 'block';
  var tagsDiv = document.getElementById('allergenTags');
  if (tagsDiv) tagsDiv.innerHTML = allergens.map(function(a) { return '<span class="allergen-tag">⚠️ ' + a + '</span>'; }).join('');
}

export function canEatBasedOnGoal(calories, protein) {
  var todayStr = new Date().toDateString();
  var todayEntries = window.historyData.filter(function(e) { return new Date(e.id).toDateString() === todayStr; });
  var consumedCal = todayEntries.reduce(function(s, e) { return s + (e.calorias || 0); }, 0);
  var consumedProt = todayEntries.reduce(function(s, e) { return s + (e.proteinas || 0); }, 0);
  var remainingCal = window.metas.cal - consumedCal;
  var remainingProt = window.metas.prot - consumedProt;
  if (calories <= remainingCal && protein <= remainingProt) {
    return { answer: 'yes', reason: '✅ ¡Sí! Aún te quedan ' + remainingCal + ' kcal y ' + remainingProt + 'g de proteína para hoy.' };
  }
  var reason = '';
  if (calories > remainingCal) reason += '❌ Excede tu meta calórica diaria (faltan ' + remainingCal + ' kcal). ';
  if (protein > remainingProt) reason += '❌ Excede tu meta de proteína (faltan ' + remainingProt + 'g).';
  return { answer: 'no', reason: reason || '⚠️ No es recomendable ahora.' };
}

export function showCanEatCard(calories, protein) {
  var btn = document.getElementById('canEatBtn');
  var card = document.getElementById('canEatCard');
  if (!btn || !card) return;
  btn.style.display = 'flex';
  btn.onclick = function() {
    var result = canEatBasedOnGoal(calories, protein);
    card.style.display = 'block';
    card.className = 'can-eat-card ' + result.answer;
    var emoji = result.answer === 'yes' ? '✅' : '❌';
    var answerText = result.answer === 'yes' ? '¡Sí, puedes comerlo!' : 'Mejor evítalo ahora';
    card.innerHTML = '<div class="can-eat-emoji">' + emoji + '</div><div class="can-eat-answer ' + result.answer + '">' + answerText + '</div><div class="can-eat-reason">' + result.reason + '</div><button class="can-eat-close" onclick="this.parentElement.style.display=\'none\'">Entendido</button>';
  };
}

window.liveIMC = function() {
  var peso = parseFloat(document.getElementById('pPeso')?.value);
  var altura = parseFloat(document.getElementById('pAltura')?.value);
  var container = document.getElementById('imcDisplayContainer');
  if (!container) return;
  if (!peso || !altura || peso <= 0 || altura <= 0) {
    container.style.display = 'none'; return;
  }
  var imc = peso / ((altura / 100) ** 2);
  var r = Math.round(imc * 10) / 10;
  var cat, cls;
  if (imc < 18.5) { cat = 'Bajo peso'; cls = 'bajo'; }
  else if (imc < 25) { cat = 'Normal'; cls = 'normal'; }
  else if (imc < 30) { cat = 'Sobrepeso'; cls = 'sobrepeso'; }
  else { cat = 'Obesidad'; cls = 'obesidad'; }
  var desc = cat === 'Normal' ? 'Peso saludable ✅' : cat === 'Bajo peso' ? 'Podrías necesitar aumentar de peso ⚠️' : 'Considera consultar a un especialista ⚠️';
  var pct = Math.min(Math.max((imc - 10) / 30 * 100, 0), 100);
  container.style.display = 'block';
  container.innerHTML = '<div class="imc-card"><div class="imc-header"><span class="imc-header-title">Índice de Masa Corporal</span><span class="imc-header-value ' + cls + '">' + r + '</span></div><div class="imc-bar-track"><div class="imc-bar-gradient"></div><div class="imc-bar-fill ' + cls + '" style="width:' + pct + '%"></div><div class="imc-bar-marker" style="left:' + pct + '%"></div></div><div class="imc-bar-labels"><span>10</span><span>18.5</span><span>25</span><span>30</span><span>40</span></div><div class="imc-bar-ranges"><span class="bajo">Bajo</span><span class="normal">Normal</span><span class="sobrepeso">Sobre</span><span class="obesidad">Obesidad</span></div><div style="text-align:center"><span class="imc-category ' + cls + '">' + cat + ' · ' + desc + '</span></div></div>';
};

window.resizeImage = function(file, maxDim, quality) {
  maxDim = maxDim || 1024; quality = quality || 0.85;
  return new Promise(function(resolve, reject) {
    var reader = new FileReader();
    reader.onload = function(ev) {
      var img = new Image();
      img.onload = function() {
        var canvas = document.createElement('canvas');
        var w = img.width, h = img.height;
        if (w > maxDim || h > maxDim) { if (w > h) { h = Math.round(h * maxDim / w); w = maxDim; } else { w = Math.round(w * maxDim / h); h = maxDim; } }
        canvas.width = w; canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = reject;
      img.src = ev.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};
window.showPreview = function(base64) {
  var p = document.getElementById('preview');
  if (p) p.src = base64;
  document.getElementById('uploadZone').classList.add('has-image');
  var btn = document.getElementById('btnAnalyze');
  if (btn) btn.disabled = false;
};

window.clearImage = function() {
  window.imageBase64 = null;
  document.getElementById('uploadZone').classList.remove('has-image');
  var p = document.getElementById('preview');
  if (p) p.src = '';
  var fi = document.getElementById('fileInput');
  if (fi) fi.value = '';
  var btn = document.getElementById('btnAnalyze');
  if (btn) btn.disabled = true;
  var eb = document.getElementById('errorBox');
  if (eb) eb.style.display = 'none';
  var rc = document.getElementById('resultCard');
  if (rc) rc.style.display = 'none';
};

window.showResult = function(r) {
  var t2 = document.getElementById('dishName'); if(t2) t2.textContent = r.plato || '—';
  var cn = document.getElementById('calNum'); if(cn) cn.textContent = r.calorias || 0;
  var pv = document.getElementById('protVal'); if(pv) pv.textContent = r.proteinas || 0;
  var cv = document.getElementById('carbVal'); if(cv) cv.textContent = r.carbos || 0;
  var fv = document.getElementById('fatVal'); if(fv) fv.textContent = r.grasas || 0;
  var ce = document.getElementById('consejoEl'); if(ce) ce.textContent = r.consejo || '';
  var iw = document.getElementById('ingTags');
  if(iw) { iw.innerHTML = ''; (r.ingredientes || []).forEach(function(ing) { var sp = document.createElement('span'); sp.className = 'tag'; sp.textContent = ing; iw.appendChild(sp); }); }
  if(isPro()) {
    var mg = document.getElementById('microGrid');
    if(mg) mg.innerHTML = '<div class="micro-item"><div class="micro-name">Fibra</div><div class="micro-val green">' + (r.fibra||0) + 'g</div></div><div class="micro-item"><div class="micro-name">Az\u00facares</div><div class="micro-val gold">' + (r.azucares||0) + 'g</div></div><div class="micro-item"><div class="micro-name">Sodio</div><div class="micro-val ' + ((r.sodio||0)>600?'red':'green') + '">' + (r.sodio||0) + 'mg</div></div>';
  }
  var pctCal = Math.min(Math.round(((r.calorias||0)/window.metas.cal)*100),150);
  var pctProt = Math.min(Math.round(((r.proteinas||0)/window.metas.prot)*100),150);
  var ccf = document.getElementById('cmpCalFill'); if(ccf) ccf.style.width = Math.min(pctCal,100)+'%';
  var cpf = document.getElementById('cmpProtFill'); if(cpf) cpf.style.width = Math.min(pctProt,100)+'%';
  document.getElementById('cmpCalPct').textContent = pctCal+'%';
  document.getElementById('cmpProtPct').textContent = pctProt+'%';
  document.getElementById('resultCard').style.display = 'block';
  document.getElementById('aiSummaryBtn').style.display = 'flex';
  // Consejo IA complementario
  var cd = document.getElementById('aiConsejoDental');
  if(!cd) { cd = document.createElement('div'); cd.id = 'aiConsejoDental'; cd.style.cssText = 'background:var(--accent-dim);border-left:3px solid var(--accent);padding:12px 14px;margin-top:12px;border-radius:0 12px 12px 0;font-size:12px;line-height:1.5;'; document.getElementById('resultCard').appendChild(cd); }
  var tips=[], prot=r.proteinas||0, carbs=r.carbos||0, fat=r.grasas||0, cal=r.calorias||0;
  var tm=prot+carbs+fat;
  if(tm>0) { var pp=prot/tm*100, cp=carbs/tm*100, fp=fat/tm*100; if(pp>=30) tips.push('✅ Alto en prote\u00edna: ideal para saciedad y recuperaci\u00f3n muscular.'); else tips.push('💪 Considera agregar m\u00e1s prote\u00edna.'); if(cp>55) tips.push('🌾 Plato con carbohidratos abundantes.'); else if(cp<20) tips.push('🥬 Bajo en carbohidratos.'); if(fp>35) tips.push('🥑 Grasas en proporci\u00f3n moderada.'); }
  if(cal>0 && window.metas.cal>0) { var cr=cal/window.metas.cal; if(cr>0.7) tips.push('📊 Esta comida cubre gran parte de tus calor\u00edas diarias.'); }
  if(r.fibra && r.fibra>5) tips.push('🌿 Excelente aporte de fibra.');
  if(!tips.length) tips.push('🥗 Intenta incluir m\u00e1s verduras.');
  cd.innerHTML = '<strong>💡 Consejo IA:</strong><br>' + tips.slice(0,2).join('<br>');
};
window.saveToHistory = async function(r, img) {
  var thumb = img ? (window.makeThumbnail ? await window.makeThumbnail(img) : '') : '';
  var entry = { id:Date.now(), date:new Date().toLocaleString('es-CO',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}), plato:r.plato, calorias:r.calorias||0, proteinas:r.proteinas||0, carbos:r.carbos||0, grasas:r.grasas||0, ingredientes:r.ingredientes||[], consejo:r.consejo||'', img:thumb };
  window.historyData.unshift(entry);
  if(window.historyData.length>60) window.historyData.pop();
  lsSet('nl_history', window.historyData);
  updateMetasUI();
  if(window.updateStreak) window.updateStreak();
  if(window.renderWeeklyMacrosChart) window.renderWeeklyMacrosChart();
  if(window.renderMonthComparison) window.renderMonthComparison();
  if(window.generateWeeklyReport) window.generateWeeklyReport();
  if(window.currentUser) { var m = await import('./db.js'); m.saveEntryToFS(entry).catch(function(){}); }
};
window.shareResult = function() {
  if(!window.lastAnalysis) { showToast(t('toastNoResult')); return; }
  var txt = '\uD83C\uDF7D\uFE0F Analic\u00e9 "' + window.lastAnalysis.plato + '" con NutriLent AI: ' + window.lastAnalysis.calorias + ' kcal, ' + window.lastAnalysis.proteinas + 'g prote\u00edna. \u00a1Desc\u00e1rgalo gratis! \u2192 nutrilent.app';
  if(navigator.share) navigator.share({title:'NutriLent AI',text:txt}).catch(function(){}); else navigator.clipboard?.writeText(txt).then(function(){ showToast(t('toastCopied')); });
};
window.analyze = async function() {
  var eb = document.getElementById('errorBox'); if(eb) eb.style.display = 'none';
  var rc = document.getElementById('resultCard'); if(rc) rc.style.display = 'none';
  if(!window.imageBase64) { if(eb) { eb.textContent = t('noImage'); eb.style.display = 'block'; } return; }
  if(window.checkLimit && !window.checkLimit()) return;
  window.startScan();
  try {
    var ln = { es:'espa\u00f1ol', en:'English', pt:'Portugu\u00eas' }[currentLang] || 'espa\u00f1ol';
    var b64 = window.imageBase64.split(',')[1];
    var rk = localStorage.getItem('nl_region') || 'LATAM_MEX_CENTRO';
    var ctx = window.GLOBAL_BRAIN?.[rk] || {};
    var cc = (ctx.base ? 'Contexto cultural: ' + ctx.base + '. ' : '') + 'Responde en ' + ln + '.';
    var prompt = cc + 'Eres un nutricionista. Analiza la imagen de comida. Responde SOLO en ' + ln + ' con JSON: {"plato":"","ingredientes":[],"calorias":0,"proteinas":0,"carbos":0,"grasas":0,"fibra":0,"sodio":0,"azucares":0,"indice_glucemico":0,"clasificacion_gi":"low","consejo":"consejo nutricional 2-3 oraciones"} clasificacion_gi: "low"(<55), "medium"(55-70), "high"(>70)';
    var res = await fetch(WORKER_URL, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({messages:[{role:'user',content:[{type:'image',source:{type:'base64',media_type:'image/jpeg',data:b64}},{type:'text',text:prompt}]}], condiciones:window.selectedConditions, max_tokens:8192}) });
    var data = await res.json();
    window.stopScan();
    var raw = (data.text || '').trim().replace(/^```json\s*/i,'').replace(/```\s*$/i,'').trim();
    var fb = raw.indexOf('{'), lb = raw.lastIndexOf('}');
    if(fb===-1||lb===-1) throw new Error('JSON no encontrado');
    var json = raw.substring(fb,lb+1).replace(/,\s*([}\]])/g,'$1');
    var result = JSON.parse(json);
    window.lastAnalysis = result;
    window.showResult(result);
    window.saveToHistory(result, window.imageBase64);
    var al = window.detectAllergens ? window.detectAllergens(result.ingredientes||[]) : [];
    if(window.showAllergens) window.showAllergens(al);
    if(window.showCanEatCard) window.showCanEatCard(result.calorias||0, result.proteinas||0);
  } catch(err) {
    window.stopScan();
    if(eb) { eb.textContent = 'Error: ' + err.message; eb.style.display = 'block'; }
    console.error('\u274C Error en an\u00e1lisis:', err);
  }
};

window.obtenerPromptCultural = function() {
  var regionKey = localStorage.getItem('nl_region') || 'LATAM_MEX_CENTRO';
  var region = (typeof GLOBAL_BRAIN !== 'undefined' ? GLOBAL_BRAIN : window.GLOBAL_BRAIN)?.[regionKey];
  if (!region) return '';
  return 'Contexto cultural: ' + region.paises + '. Base alimenticia: ' + region.base + '. Perfil: ' + region.vibe + '.';
};
