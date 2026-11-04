/* MOVI KIDS — Firebase RTDB sessoes (Pacote M.2) */
import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.0.0/firebase-app.js';
import { getDatabase, ref, onValue } from 'https://www.gstatic.com/firebasejs/11.0.0/firebase-database.js';

const fbApp = initializeApp({
  apiKey: 'AIzaSyBIZdsHHzeWjQzHPWBWIOMJUf1AYYYlykA',
  authDomain: 'movikids-fa3d7.firebaseapp.com',
  databaseURL: 'https://movikids-fa3d7-default-rtdb.firebaseio.com',
  projectId: 'movikids-fa3d7',
  storageBucket: 'movikids-fa3d7.firebasestorage.app',
  messagingSenderId: '149994372494',
  appId: '1:149994372494:web:eea86e5c248ccde95438df',
});
const fbDb = getDatabase(fbApp);

onValue(ref(fbDb, 'sessoes'), (snapshot) => {
  const sessoes = snapshot.val();
  if (!sessoes) return;

  const hoje = (() => {
    const d = new Date();
    const pad = n => String(n).padStart(2, '0');
    return pad(d.getDate()) + '/' + pad(d.getMonth() + 1) + '/' + d.getFullYear();
  })();

  /* I197: Firebase NÃO é autoridade de Ativa/Pendente (I151/I191).
   * RTDB fica stale (salvar/▶ não escrevem; encerrar pode falhar) e ressuscita fantasma.
   * Só dispara reconcile via listarAtivas. */
  const nAtivas = Object.values(sessoes).filter(s =>
    s.status === 'Ativa' || s.status === 'Pendente'
  ).length;
  window._fbLastUpdate = Date.now();
  window._fbAtivasHint = nAtivas;
  if (typeof setStatus === 'function') setStatus(true);
  if (typeof mkSyncListarAtivasFallback_ === 'function') {
    mkSyncListarAtivasFallback_({ silent: true });
  } else if (typeof mkScheduleFantasmaReconcile_ === 'function') {
    mkScheduleFantasmaReconcile_();
  }
}, (error) => {
  console.warn('[Firebase] Erro ao ouvir sessoes:', error.message);
});

window._firebaseDB = fbDb;
