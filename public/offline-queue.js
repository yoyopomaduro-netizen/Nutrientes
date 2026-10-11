// ── Cola offline para NutriLent AI ─────────────────────────────────────
// Guarda localmente (localStorage) los registros que no pudieron enviarse
// a Firestore por falta de conexión o por un fallo en la escritura.
//
// Cada registro queda "garantizado" con:
//   - uid        : identificador del usuario autenticado (obligatorio)
//   - fecha      : fecha local de la transacción (YYYY-MM-DD)
//   - timestamp  : instante exacto de la transacción (ISO 8601 con hora)

const STORAGE_KEY = "nutrilent_offline_queue";
const MAX_ITEMS = 200;

// Acceso seguro a localStorage (puede no existir en Node/SSR o lanzar
// una excepción en modo privado de algunos navegadores).
function getStorage() {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      return window.localStorage;
    }
  } catch (_err) {
    /* ignorar */
  }
  return null;
}

function readQueue() {
  const storage = getStorage();
  if (!storage) return [];
  try {
    const raw = storage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (_err) {
    return [];
  }
}

function writeQueue(queue) {
  const storage = getStorage();
  if (!storage) return false;
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(queue));
    return true;
  } catch (_err) {
    return false;
  }
}

// Fecha local en formato YYYY-MM-DD (sin desfase de zona horaria).
function localDateISO(date) {
  const d = date || new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * Añade un registro a la cola offline.
 *
 * Formas aceptadas:
 *   push(uid, datos)          → forma recomendada
 *   push({ uid, ...datos })   → compatibilidad (si el objeto ya trae uid)
 *
 * Garantiza que cada registro guardado incluya `uid`, `fecha` y
 * `timestamp`. Lanza TypeError si `uid` no está presente.
 *
 * @param {string} uid - Identificador del usuario autenticado.
 * @param {Object} datos - Registro de consumo a encolar.
 * @returns {Object} El registro tal cual quedó guardado.
 */
function push(uid, datos) {
  // Compatibilidad con push({ uid, ...datos })
  if (arguments.length === 1 && uid && typeof uid === "object" && !Array.isArray(uid)) {
    if (typeof uid.uid !== "string" || !uid.uid.trim()) {
      throw new TypeError('OfflineQueue.push: falta "uid" en el registro');
    }
    return push(uid.uid, uid);
  }

  if (typeof uid !== "string" || !uid.trim()) {
    throw new TypeError('OfflineQueue.push: "uid" es obligatorio');
  }
  if (!datos || typeof datos !== "object" || Array.isArray(datos)) {
    throw new TypeError('OfflineQueue.push: "datos" debe ser un objeto');
  }

  const now = new Date();
  const entry = {
    ...datos,
    // uid y fecha/timestamp se imponen al final para que ningún campo
    // del registro pueda sobrescribirlos.
    uid: uid.trim(),
    fecha: localDateISO(now),
    timestamp: now.toISOString(),
    _enqueuedAt: now.getTime(),
  };

  const queue = readQueue();
  queue.push(entry);
  const trimmed = queue.length > MAX_ITEMS ? queue.slice(-MAX_ITEMS) : queue;
  writeQueue(trimmed);

  return entry;
}

const OfflineQueue = {
  push,
  getAll: readQueue,
  count: () => readQueue().length,
  clear: () => writeQueue([]),
};

export { push, readQueue, writeQueue, STORAGE_KEY };
export default OfflineQueue;
