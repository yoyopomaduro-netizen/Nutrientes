import { FB_CONFIG } from './config.js';
import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc, collection, query, orderBy, limit, getDocs, writeBatch, deleteDoc } from "firebase/firestore";

const app = initializeApp(FB_CONFIG);
export const db = getFirestore(app);

export function lsGet(k, d) {
  try { return JSON.parse(localStorage.getItem(k) || 'null') ?? d; }
  catch { return d; }
}
export function lsSet(k, v) {
  try { localStorage.setItem(k, JSON.stringify(v)); } catch {}
}
function getUsageKey() {
  return `nl_usage_${new Date().getFullYear()}_${new Date().getMonth()}`;
}
export function getUsage() { return lsGet(getUsageKey(), 0); }
export function incUsage() { const k = getUsageKey(); lsSet(k, lsGet(k, 0) + 1); }

export function setText(id, txt) {
  const e = document.getElementById(id);
  if (e) e.textContent = txt;
}

export async function saveProfileToFS() {
  if (!window.currentUser) return;
  await setDoc(doc(db, 'users', window.currentUser.uid), {
    profile: window.profile, metas: window.metas, plan: window.plan,
    lang: window.currentLang, updatedAt: Date.now()
  }, { merge: true });
}

export async function saveEntryToFS(entry) {
  if (!window.currentUser) return;
  await setDoc(doc(db, 'users', window.currentUser.uid, 'history', String(entry.id)), entry);
}

export async function clearFSHistory() {
  if (!window.currentUser) return;
  const snap = await getDocs(collection(db, 'users', window.currentUser.uid, 'history'));
  const batch = writeBatch(db);
  snap.forEach(d => batch.delete(d.ref));
  await batch.commit();
}

export async function loadFromFS(uid) {
  const showSync = window.showSync;
  const hideSync = window.hideSync;
  if (showSync) showSync(window.t ? window.t('syncCloud') : 'Sincronizando...');
  try {
    const docSnap = await getDoc(doc(db, 'users', uid));
    if (docSnap.exists()) {
      const d = docSnap.data();
      if (d.profile) { window.profile = d.profile; lsSet('nl_profile', d.profile); }
      if (d.metas) { window.metas = d.metas; lsSet('nl_metas', d.metas); }
      if (d.plan) { window.plan = d.plan; lsSet('nl_plan', d.plan); }
      else if (d.isPro !== undefined) {
        window.plan.tier = d.isPro ? 'pro_monthly' : 'free';
        lsSet('nl_plan', window.plan);
      }
      if (d.lang) {
        const { setLang } = await import('./i18n.js');
        setLang(d.lang);
      }
      if (d.history && Array.isArray(d.history)) {
        window.historyData = d.history;
        lsSet('nl_history', d.history);
      }
      if (d.historyEntries) {
        window.historyData = d.historyEntries;
        lsSet('nl_history', d.historyEntries);
      }
    }
    // Legacy: load from subcollection
    const histSnap = await getDocs(query(
      collection(db, 'users', uid, 'history'),
      orderBy('id', 'desc'),
      limit(60)
    ));
    if (!histSnap.empty) {
      window.historyData = histSnap.docs.map(d => d.data());
      lsSet('nl_history', window.historyData);
    }
    if (window.updateMetasUI) window.updateMetasUI();
  } finally {
    if (hideSync) hideSync();
  }
}

export function checkLimit() {
  if (window.isPro()) return true;
  if (getUsage() >= FREE_LIMIT) { window.openModal(); return false; }
  return true;
}

window.checkLimit = checkLimit;
window.makeThumbnail = function(base64, size) {
  size = size || 120;
  return new Promise(function(resolve) {
    var img = new Image();
    img.onload = function() {
      var canvas = document.createElement('canvas');
      canvas.width = size; canvas.height = size;
      var ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, size, size);
      resolve(canvas.toDataURL('image/jpeg', 0.6));
    };
    img.onerror = function() { resolve(''); };
    img.src = base64;
  });
};
