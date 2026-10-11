// ── Servicio de base de datos (Firestore) para NutriLent AI ──────────────
// Recibe la instancia de Firestore que la app ya inicializó y expone
// escrituras "offline-first": si no hay conexión (o la escritura falla),
// el dato se encola localmente con OfflineQueue para reintentarlo luego
// mediante flushOfflineQueue().
//
// Esquema (el mismo que ya usa la app):
//   - users/{uid}                       → perfil, metas, isPro, lang
//   - users/{uid}/history/{entryId}     → un plato escaneado

import { doc, setDoc } from "firebase/firestore";
import OfflineQueue, { readQueue, writeQueue } from "./offline-queue.js";

let db = null;

const CLAVES_COLA = ["_tipo", "uid", "fecha", "timestamp", "_enqueuedAt"];

/**
 * Inicializa el servicio con la instancia de Firestore de la app.
 * Debe llamarse una sola vez, después de `getFirestore(app)`.
 *
 * @param {import("firebase/firestore").Firestore} firestoreDb
 */
export function initDatabaseService(firestoreDb) {
  db = firestoreDb;
}

const hayConexion = () =>
  typeof navigator === "undefined" ? true : navigator.onLine !== false;

// Quita las claves que OfflineQueue inyecta (uid/fecha/timestamp/_enqueuedAt)
// y el discriminador interno `_tipo`, para no contaminar los documentos.
function sinMetaCola(registro) {
  const limpio = { ...registro };
  CLAVES_COLA.forEach((k) => delete limpio[k]);
  return limpio;
}

function escribirConsumo(uid, datos) {
  const entry = sinMetaCola(datos);
  return setDoc(doc(db, "users", uid, "history", String(entry.id)), entry);
}

function escribirPlan(uid, plan) {
  const payload = { ...sinMetaCola(plan), updatedAt: Date.now() };
  return setDoc(doc(db, "users", uid), payload, { merge: true });
}

/**
 * Guarda el plan/perfil del usuario en `users/{uid}` (merge).
 * Si está offline o la escritura falla, se encola en OfflineQueue.
 *
 * @param {string} uid - Identificador del usuario autenticado.
 * @param {Object} plan - Objeto con profile, metas, isPro, lang, etc.
 * @returns {Promise<{guardado: boolean, offline: boolean, error?: string}>}
 */
export async function guardarPlanActual(uid, plan) {
  if (!uid) throw new TypeError('"uid" es obligatorio');
  if (!db) throw new Error("initDatabaseService() no ha sido llamado");

  const datos = { _tipo: "perfil", ...plan };
  if (!hayConexion()) {
    OfflineQueue.push(uid, datos);
    return { guardado: false, offline: true };
  }
  try {
    await escribirPlan(uid, datos);
    return { guardado: true, offline: false };
  } catch (err) {
    OfflineQueue.push(uid, datos);
    return { guardado: false, offline: true, error: err?.message };
  }
}

/**
 * Guarda un plato escaneado en `users/{uid}/history/{entryId}`.
 * Si está offline o la escritura falla, se encola en OfflineQueue.
 *
 * @param {string} uid - Identificador del usuario autenticado.
 * @param {Object} datos - Registro de comida (debe traer `id`).
 * @returns {Promise<{guardado: boolean, offline: boolean, error?: string}>}
 */
export async function registrarConsumoDiario(uid, datos) {
  if (!uid) throw new TypeError('"uid" es obligatorio');
  if (!db) throw new Error("initDatabaseService() no ha sido llamado");

  const entry = { _tipo: "consumo", ...datos };
  if (!hayConexion()) {
    OfflineQueue.push(uid, entry);
    return { guardado: false, offline: true };
  }
  try {
    await escribirConsumo(uid, entry);
    return { guardado: true, offline: false };
  } catch (err) {
    OfflineQueue.push(uid, entry);
    return { guardado: false, offline: true, error: err?.message };
  }
}

/**
 * Reintenta todos los registros encolados contra Firestore.
 * Los que se guardan correctamente se eliminan de la cola.
 *
 * @returns {Promise<{procesados: number, pendientes: number}>}
 */
export async function flushOfflineQueue() {
  if (!db) return { procesados: 0, pendientes: 0 };
  const cola = readQueue();
  if (!cola.length) return { procesados: 0, pendientes: 0 };

  console.log(`[OfflineSync] ⚡ Reintentando sincronización de ${cola.length} elementos pendientes...`);

  const pendientes = [];
  let procesados = 0;
  for (const item of cola) {
    try {
      if (item._tipo === "perfil") {
        await escribirPlan(item.uid, item);
      } else {
        await escribirConsumo(item.uid, item);
      }
      procesados++;
    } catch (_err) {
      pendientes.push(item);
    }
  }
  writeQueue(pendientes);
  return { procesados, pendientes: pendientes.length };
}

export default {
  initDatabaseService,
  guardarPlanActual,
  registrarConsumoDiario,
  flushOfflineQueue,
};
