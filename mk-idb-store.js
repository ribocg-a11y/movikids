/* MOVI KIDS — IndexedDB local store (Fase 1 leitura + Fase 2 fila) v1.9.104 */

const MK_IDB_NAME = 'movikids_local_v1';
const MK_IDB_VER = 2;
const MK_IDB_STORE = 'kv';
const MK_IDB_QUEUE = 'queue';

function mkIdbOpen_() {
  return new Promise(function (resolve, reject) {
    if (!window.indexedDB) {
      reject(new Error('indexedDB indisponivel'));
      return;
    }
    const req = indexedDB.open(MK_IDB_NAME, MK_IDB_VER);
    req.onupgradeneeded = function (ev) {
      const db = ev.target.result;
      if (!db.objectStoreNames.contains(MK_IDB_STORE)) db.createObjectStore(MK_IDB_STORE);
      if (!db.objectStoreNames.contains(MK_IDB_QUEUE)) db.createObjectStore(MK_IDB_QUEUE, { keyPath: 'id' });
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

function mkIdbQueueList_() {
  return mkIdbOpen_().then(function (db) {
    return new Promise(function (resolve, reject) {
      const tx = db.transaction(MK_IDB_QUEUE, 'readonly');
      const req = tx.objectStore(MK_IDB_QUEUE).getAll();
      req.onsuccess = function () {
        const list = (req.result || []).sort(function (a, b) { return (a.createdAt || 0) - (b.createdAt || 0); });
        resolve(list);
      };
      req.onerror = function () { reject(req.error); };
    });
  }).catch(function () { return []; });
}

function mkIdbQueuePush_(item) {
  return mkIdbOpen_().then(function (db) {
    return new Promise(function (resolve, reject) {
      const tx = db.transaction(MK_IDB_QUEUE, 'readwrite');
      tx.objectStore(MK_IDB_QUEUE).put(item);
      tx.oncomplete = function () { resolve(true); };
      tx.onerror = function () { reject(tx.error); };
    });
  });
}

function mkIdbQueueRemove_(id) {
  return mkIdbOpen_().then(function (db) {
    return new Promise(function (resolve, reject) {
      const tx = db.transaction(MK_IDB_QUEUE, 'readwrite');
      tx.objectStore(MK_IDB_QUEUE).delete(id);
      tx.oncomplete = function () { resolve(true); };
      tx.onerror = function () { reject(tx.error); };
    });
  });
}

async function mkIdbQueueCount_() {
  const list = await mkIdbQueueList_();
  return list.length;
}

window.mkIdbGetSnapshot_ = mkIdbGetSnapshot_;
window.mkIdbPutSnapshot_ = mkIdbPutSnapshot_;
window.mkIdbClearSnapshot_ = mkIdbClearSnapshot_;
window.mkIdbQueueList_ = mkIdbQueueList_;
window.mkIdbQueuePush_ = mkIdbQueuePush_;
window.mkIdbQueueRemove_ = mkIdbQueueRemove_;
window.mkIdbQueueCount_ = mkIdbQueueCount_;
