/* MOVI KIDS — IndexedDB local store (Fase 1 leitura offline) v1.9.102 */

const MK_IDB_NAME = 'movikids_local_v1';
const MK_IDB_VER = 1;
const MK_IDB_STORE = 'kv';

function mkIdbOpen_() {
  return new Promise(function (resolve, reject) {
    if (!window.indexedDB) {
      reject(new Error('indexedDB indisponivel'));
      return;
    }
    const req = indexedDB.open(MK_IDB_NAME, MK_IDB_VER);
    req.onupgradeneeded = function (ev) {
      ev.target.result.createObjectStore(MK_IDB_STORE);
    };
    req.onsuccess = function () { resolve(req.result); };
    req.onerror = function () { reject(req.error || new Error('idb open')); };
  });
}

function mkIdbGet_(key) {
  return mkIdbOpen_().then(function (db) {
    return new Promise(function (resolve, reject) {
      const tx = db.transaction(MK_IDB_STORE, 'readonly');
      const req = tx.objectStore(MK_IDB_STORE).get(key);
      req.onsuccess = function () { resolve(req.result == null ? null : req.result); };
      req.onerror = function () { reject(req.error); };
    });
  });
}

function mkIdbPut_(key, val) {
  return mkIdbOpen_().then(function (db) {
    return new Promise(function (resolve, reject) {
      const tx = db.transaction(MK_IDB_STORE, 'readwrite');
      tx.objectStore(MK_IDB_STORE).put(val, key);
      tx.oncomplete = function () { resolve(true); };
      tx.onerror = function () { reject(tx.error); };
    });
  });
}

function mkIdbDel_(key) {
  return mkIdbOpen_().then(function (db) {
    return new Promise(function (resolve, reject) {
      const tx = db.transaction(MK_IDB_STORE, 'readwrite');
      tx.objectStore(MK_IDB_STORE).delete(key);
      tx.oncomplete = function () { resolve(true); };
      tx.onerror = function () { reject(tx.error); };
    });
  });
}

async function mkIdbGetSnapshot_() {
  try {
    return await mkIdbGet_('snapshot_v1');
  } catch (e) {
    return null;
  }
}

async function mkIdbPutSnapshot_(payload) {
  try {
    await mkIdbPut_('snapshot_v1', payload);
    return true;
  } catch (e) {
    return false;
  }
}

async function mkIdbClearSnapshot_() {
  try {
    await mkIdbDel_('snapshot_v1');
    return true;
  } catch (e) {
    return false;
  }
}

window.mkIdbGetSnapshot_ = mkIdbGetSnapshot_;
window.mkIdbPutSnapshot_ = mkIdbPutSnapshot_;
window.mkIdbClearSnapshot_ = mkIdbClearSnapshot_;
