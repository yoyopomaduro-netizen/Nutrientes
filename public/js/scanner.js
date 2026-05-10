import { showToast } from './ui.js';
import { COLOMBIAN_PRODUCTS } from './config.js';

window.startBarcodeScanner = async function() {
  var scanOverlay = document.getElementById('barcodeScanOverlay');
  if (!scanOverlay) {
    scanOverlay = document.createElement('div');
    scanOverlay.id = 'barcodeScanOverlay';
    scanOverlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.95);z-index:9999;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;padding:20px;';
    scanOverlay.innerHTML = '<div style="font-family:var(--font-display);font-size:18px;font-weight:700;color:#AAFF00;text-align:center;">📱 Escanear código de barras</div><div style="position:relative;width:100%;max-width:320px;"><video id="barcodeVideo" style="width:100%;border-radius:14px;background:#000;display:block;" autoplay playsinline muted></video><div style="position:absolute;inset:12%;border:2.5px solid #AAFF00;border-radius:8px;box-shadow:0 0 0 9999px rgba(0,0,0,0.55);pointer-events:none;"></div></div><div id="barcodeScanStatus" style="font-size:13px;color:rgba(255,255,255,0.65);text-align:center;max-width:260px;">Apunta la cámara al código de barras del producto</div><button onclick="window.closeBarcodeScanner()" style="background:transparent;border:1px solid rgba(255,255,255,0.3);color:#fff;border-radius:20px;padding:10px 28px;font-size:13px;cursor:pointer;margin-top:4px;">Cancelar</button>';
    document.body.appendChild(scanOverlay);
  }
  scanOverlay.style.display = 'flex';
  try {
    if (typeof ZXing === 'undefined') throw new Error('ZXing no disponible');
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) throw new Error('Cámara no disponible');
    var codeReader = new ZXing.BrowserMultiFormatReader();
    window._zxingReader = codeReader;
    var videoEl = document.getElementById('barcodeVideo');
    var statusEl = document.getElementById('barcodeScanStatus');
    var allDevices = await navigator.mediaDevices.enumerateDevices();
    var devices = allDevices.filter(function(d) { return d.kind === 'videoinput'; });
    var backCamera = devices.find(function(d) { return /back|rear|environment/i.test(d.label); }) || devices[devices.length - 1];
    var deviceId = backCamera?.deviceId;
    if (statusEl) statusEl.textContent = '🔍 Buscando código...';
    codeReader.decodeFromVideoDevice(deviceId, videoEl, function(result, err) {
      if (result) {
        var code = result.getText();
        if (statusEl) statusEl.textContent = '✅ Código: ' + code;
        window.closeBarcodeScanner();
        lookupBarcodeByCode(code);
      }
    });
  } catch (e) {
    window.closeBarcodeScanner();
    console.warn('ZXing error:', e);
    var manual = prompt('No se pudo acceder a la cámara.\nIngresa el código de barras manualmente (8-13 dígitos):');
    if (manual && /^\d{8,13}$/.test(manual.trim())) await lookupBarcodeByCode(manual.trim());
    else if (manual) showToast('❌ Código inválido. Debe tener 8-13 dígitos.');
  }
};

window.closeBarcodeScanner = function() {
  if (window._zxingReader) { try { window._zxingReader.reset(); } catch (e) {} window._zxingReader = null; }
  var overlay = document.getElementById('barcodeScanOverlay');
  if (overlay) overlay.style.display = 'none';
};

window.toggleCamera = async function() {
  var wrap = document.getElementById('cameraWrap'), feed = document.getElementById('cameraFeed');
  if (wrap && wrap.classList.contains('open')) {
    wrap.classList.remove('open');
    if (window.cameraStream) { window.cameraStream.getTracks().forEach(function(t) { t.stop(); }); window.cameraStream = null; }
    return;
  }
  if (!wrap || !feed) return;
  try {
    window.cameraStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } } });
    feed.srcObject = window.cameraStream;
    wrap.classList.add('open');
  } catch (err) {
    showToast('❌ No se pudo acceder a la cámara');
  }
};

window.capturePhoto = function() {
  var feed = document.getElementById('cameraFeed');
  if (!feed) return;
  var canvas = document.createElement('canvas');
  canvas.width = feed.videoWidth; canvas.height = feed.videoHeight;
  canvas.getContext('2d').drawImage(feed, 0, 0);
  window.imageBase64 = canvas.toDataURL('image/jpeg', 0.9);
  window.showPreview(window.imageBase64);
  window.closeCamera();
};

window.closeCamera = function() {
  var wrap = document.getElementById('cameraWrap'), feed = document.getElementById('cameraFeed');
  if (wrap) wrap.classList.remove('open');
  if (feed) feed.srcObject = null;
  if (window.cameraStream) { window.cameraStream.getTracks().forEach(function(t) { t.stop(); }); window.cameraStream = null; }
};

window.showBarcodeLoading = function(show, text) {
  var el = document.getElementById('barcodeLoading');
  var txt = document.getElementById('barcodeLoadingText');
  if (!el) return;
  el.style.display = show ? 'block' : 'none';
  if (txt && text) txt.textContent = text;
};
window.showBarcodeNotFound = function(code) {
  var resultDiv = document.getElementById('barcodeResult');
  if (!resultDiv) return;
  resultDiv.innerHTML = '<div style="text-align:center;padding:20px;color:var(--text-muted);"><div style="font-size:32px;margin-bottom:10px;">😕</div><div style="font-size:14px;font-weight:600;margin-bottom:6px;">Producto no encontrado</div><div style="font-size:12px;color:var(--text-dim);margin-bottom:14px;">No está en Open Food Facts ni USDA. Código: ' + code + '</div><div style="font-size:12px;color:var(--text-muted);margin-bottom:10px;">Ingresa los datos manualmente:</div><div style="display:flex;gap:8px;max-width:260px;margin:0 auto;"><input id="manualBarcodeName" placeholder="Nombre del producto" style="flex:1;background:var(--surface2);border:1px solid var(--border);border-radius:8px;padding:10px 12px;color:var(--text);font-size:13px;outline:none;"></div><button onclick="window.lookupManualBarcode(\'' + code + '\')" style="margin-top:10px;padding:10px 24px;background:var(--accent);border:none;border-radius:8px;color:#000;font-size:12px;font-weight:700;cursor:pointer;">Continuar</button></div>';
  resultDiv.style.display = 'block';
};

window.lookupManualBarcode = function(code) {
  var name = document.getElementById('manualBarcodeName')?.value?.trim();
  if (!name) { showToast('✏️ Escribe el nombre del producto'); return; }
  displayBarcodeResult({ product_name: name, nutriments: {}, serving_size: '100g' });
};

async function lookupBarcodeByCode(code) {
  window.showBarcodeLoading(true, '🔍 Buscando en Open Food Facts...');
  var resultDiv = document.getElementById('barcodeResult');
  if (resultDiv) resultDiv.style.display = 'none';
  try {
    var res = await fetch('https://world.openfoodfacts.org/api/v2/product/' + code + '.json');
    var data = await res.json();
    if (data.status === 1 && data.product) { window.showBarcodeLoading(false); displayBarcodeResult(data.product); return; }
  } catch (e) { console.warn('OFF error:', e); }

  window.showBarcodeLoading(true, '🔍 Buscando en USDA FoodData Central...');
  try {
    var usdaRes = await fetch('https://api.nal.usda.gov/fdc/v1/foods/search?api_key=DEMO_KEY&query=' + code + '&dataType=Branded&pageSize=3');
    var usdaData = await usdaRes.json();
    if (usdaData.foods && usdaData.foods.length > 0) {
      var searchGtin = code.replace(/^0+/, '');
      var food = usdaData.foods.find(function(f) { return (f.gtinUpc || '').replace(/^0+/, '') === searchGtin; }) || usdaData.foods[0];
      window.showBarcodeLoading(false);
      displayUSDAFoodResult(food, code);
      return;
    }
  } catch (e2) { console.warn('USDA error:', e2); }

  window.showBarcodeLoading(false);
  var local = lookupLocalProduct(code);
  if (local) { displayBarcodeResult(local); return; }
  window.showBarcodeNotFound(code);
}

function lookupLocalProduct(code) {
  var cleanCode = code.replace(/^0+/, '');
  var product = COLOMBIAN_PRODUCTS[code] || COLOMBIAN_PRODUCTS[cleanCode];
  if (product) console.log('🇨🇴 Producto colombiano encontrado:', product.product_name);
  return product || null;
}

function displayUSDAFoodResult(food, code) {
  var resultDiv = document.getElementById('barcodeResult');
  if (!resultDiv) return;
  var nutrients = {};
  (food.foodNutrients || []).forEach(function(n) { nutrients[n.nutrientId || 0] = parseFloat(n.value) || 0; });
  var name = food.description || food.brandName || 'Producto';
  var brand = food.brandName || '';
  var servingSize = food.servingSize || 100;
  var cal100 = nutrients[1008] || 0, prot100 = nutrients[1003] || 0, carb100 = nutrients[1005] || 0;
  var fat100 = nutrients[1004] || 0, fiber100 = nutrients[1079] || 0, sodium100 = nutrients[1093] || 0;
  var servingGrams = parseFloat(servingSize) || 100;
  resultDiv.innerHTML = '<div style="margin-bottom:14px;"><div style="font-family:var(--font-display);font-size:16px;font-weight:700;margin-bottom:4px;">' + name + '</div>' + (brand ? '<div style="font-size:11px;color:var(--text-muted);">' + brand + '</div>' : '') + '<div style="font-size:10px;color:var(--accent2);margin-top:4px;">🇺🇸 USDA FoodData Central</div></div><div style="background:var(--surface2);border-radius:var(--radius-sm);padding:14px;margin-top:12px;"><div style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:var(--text-muted);margin-bottom:10px;">📏 Ajustar porción</div><div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;flex-wrap:wrap;"><label style="font-size:12px;color:var(--text-muted);flex-shrink:0;">Porción (g):</label><input type="number" id="barcodePortionInput" value="' + servingGrams + '" min="1" max="9999" style="width:80px;background:var(--surface);border:1px solid var(--border-accent);border-radius:8px;padding:8px 10px;color:var(--text);font-size:14px;font-weight:700;outline:none;text-align:center;" oninput="window.updateBarcodeNutrients(this.value,' + cal100 + ',' + prot100 + ',' + carb100 + ',' + fat100 + ',' + fiber100 + ',' + sodium100 + ')"><span style="font-size:11px;color:var(--text-dim);">Ref: ' + servingSize + 'g</span></div><div id="barcodeNutrientsGrid" style="display:grid;grid-template-columns:1fr 1fr;gap:8px;"></div></div><button id="btnAddBarcodeToHistory" onclick="window.addBarcodeToHistory()" style="width:100%;margin-top:14px;padding:13px;background:var(--accent);color:#000;font-family:var(--font-display);font-size:13px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;border:none;border-radius:var(--radius-sm);cursor:pointer;transition:opacity 0.2s;">✅ Agregar al historial</button>';
  window._currentBarcodeProduct = { name: name, brand: brand, cal100: cal100, prot100: prot100, carb100: carb100, fat100: fat100, fiber100: fiber100, sodium100: sodium100, servingGrams: servingGrams, currentGrams: servingGrams };
  window.updateBarcodeNutrients(servingGrams, cal100, prot100, carb100, fat100, fiber100, sodium100);
  resultDiv.style.display = 'block';
  setTimeout(function() { resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }, 120);
}

function displayBarcodeResult(product) {
  // Same implementation as original
  var resultDiv = document.getElementById('barcodeResult');
  if (!resultDiv) return;
  var n = product.nutriments || {};
  var name = product.product_name || product.product_name_es || product.generic_name || 'Producto sin nombre';
  var brand = product.brands || '';
  var servingSizeRaw = product.serving_size || '100g';
  var servingGrams = parseFloat((servingSizeRaw.match(/(\d+\.?\d*)/) || ['100'])[0]) || 100;
  var cal100 = parseFloat(n['energy-kcal_100g'] || n['energy-kcal'] || 0);
  var prot100 = parseFloat(n['proteins_100g'] || n['proteins'] || 0);
  var carb100 = parseFloat(n['carbohydrates_100g'] || n['carbohydrates'] || 0);
  var fat100 = parseFloat(n['fat_100g'] || n['fat'] || 0);
  var fiber100 = parseFloat(n['fiber_100g'] || n['fiber'] || 0);
  var sodium100 = parseFloat(n['sodium_100g'] ? n['sodium_100g'] * 1000 : (n['salt_100g'] ? n['salt_100g'] * 400 : 0));
  var allergens = (product.allergens_tags || []).map(function(a) { return a.replace(/^[a-z]+:/, ''); }).join(', ');
  resultDiv.innerHTML = '<div style="margin-bottom:14px;"><div style="font-family:var(--font-display);font-size:16px;font-weight:700;margin-bottom:4px;">' + name + '</div>' + (brand ? '<div style="font-size:11px;color:var(--text-muted);">' + brand + '</div>' : '') + '</div>' + (allergens ? '<div class="barcode-alert"><div style="font-size:12px;font-weight:700;color:#ff4444;margin-bottom:4px;">⚠️ Alérgenos</div><div style="font-size:11px;color:var(--text-muted);">' + allergens + '</div></div>' : '') + '<div style="background:var(--surface2);border-radius:var(--radius-sm);padding:14px;margin-top:12px;"><div style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:var(--text-muted);margin-bottom:10px;">📏 Ajustar porción</div><div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;flex-wrap:wrap;"><label style="font-size:12px;color:var(--text-muted);flex-shrink:0;">Porción (g):</label><input type="number" id="barcodePortionInput" value="' + servingGrams + '" min="1" max="9999" style="width:80px;background:var(--surface);border:1px solid var(--border-accent);border-radius:8px;padding:8px 10px;color:var(--text);font-size:14px;font-weight:700;outline:none;text-align:center;" oninput="window.updateBarcodeNutrients(this.value,' + cal100 + ',' + prot100 + ',' + carb100 + ',' + fat100 + ',' + fiber100 + ',' + sodium100 + ')"><span style="font-size:11px;color:var(--text-dim);">Ref: ' + servingSizeRaw + '</span></div><div id="barcodeNutrientsGrid" style="display:grid;grid-template-columns:1fr 1fr;gap:8px;"></div></div><button id="btnAddBarcodeToHistory" onclick="window.addBarcodeToHistory()" style="width:100%;margin-top:14px;padding:13px;background:var(--accent);color:#000;font-family:var(--font-display);font-size:13px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;border:none;border-radius:var(--radius-sm);cursor:pointer;transition:opacity 0.2s;">✅ Agregar al historial</button>';
  window._currentBarcodeProduct = { name: name, brand: brand, cal100: cal100, prot100: prot100, carb100: carb100, fat100: fat100, fiber100: fiber100, sodium100: sodium100, servingGrams: servingGrams, currentGrams: servingGrams };
  window.updateBarcodeNutrients(servingGrams, cal100, prot100, carb100, fat100, fiber100, sodium100);
  resultDiv.style.display = 'block';
  setTimeout(function() { resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }, 120);
}

window.updateBarcodeNutrients = function(grams, cal100, prot100, carb100, fat100, fiber100, sodium100) {
  var g = parseFloat(grams) || 100;
  var c = function(v) { return Math.round(v * g / 100 * 10) / 10; };
  var grid = document.getElementById('barcodeNutrientsGrid');
  if (!grid) return;
  var items = [
    { label: '🔥 Calorías', value: c(cal100), unit: 'kcal', color: '#AAFF00' },
    { label: '🥩 Proteínas', value: c(prot100), unit: 'g', color: '#50f0b8' },
    { label: '🌾 Carbos', value: c(carb100), unit: 'g', color: '#f0c050' },
    { label: '🫒 Grasas', value: c(fat100), unit: 'g', color: '#ff9f40' },
    { label: '🌿 Fibra', value: c(fiber100), unit: 'g', color: '#80d0a0' },
    { label: '🧂 Sodio', value: Math.round(c(sodium100)), unit: 'mg', color: c(sodium100) > 600 ? '#ff4444' : 'var(--text-muted)' }
  ];
  grid.innerHTML = items.map(function(item) {
    return '<div style="background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:10px;text-align:center;"><div style="font-size:10px;color:var(--text-muted);margin-bottom:4px;">' + item.label + '</div><div style="font-family:var(--font-display);font-size:16px;font-weight:700;color:' + item.color + ';">' + item.value + '<span style="font-size:10px;font-weight:400;color:var(--text-muted);margin-left:2px;">' + item.unit + '</span></div></div>';
  }).join('');
  if (window._currentBarcodeProduct) window._currentBarcodeProduct.currentGrams = g;
};

window.addBarcodeToHistory = async function() {
  var bp = window._currentBarcodeProduct;
  if (!bp) return;
  var g = bp.currentGrams || bp.servingGrams || 100;
  var c = function(v) { return Math.round(v * g / 100 * 10) / 10; };
  var result = {
    plato: bp.name + (bp.brand ? ' — ' + bp.brand : '') + ' (' + g + 'g)',
    calorias: c(bp.cal100), proteinas: c(bp.prot100), carbos: c(bp.carb100), grasas: c(bp.fat100),
    fibra: c(bp.fiber100), sodio: Math.round(c(bp.sodium100)),
    ingredientes: [bp.name],
    consejo: 'Porción registrada: ' + g + 'g de ' + bp.name + '.'
  };
  await window.saveToHistory(result, null);
  if (window.renderHistory) window.renderHistory();
  showToast('✅ "' + bp.name + '" ' + 'agregado (' + g + 'g)');
  var btn = document.getElementById('btnAddBarcodeToHistory');
  if (btn) { btn.textContent = '✓ Agregado al historial'; btn.style.opacity = '0.5'; btn.disabled = true; }
};
