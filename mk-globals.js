/* MOVI KIDS - estado global compartilhado (Pacote M.17) */

const APP_VERSION = (typeof window !== 'undefined' && window.MK_VERSION) ? window.MK_VERSION : '1.7.88';
const PORTAL_RESPONSAVEL_URL = 'https://ribocg-a11y.github.io/movikids/acompanhar.html';

let PRECOS = {
  'Carro':   { '10min':{v:12,m:10,a:1.00},'20min':{v:22,m:20,a:1.00},'30min':{v:30,m:30,a:1.00},
               '40min':{v:40,m:40,a:1.00},'60min':{v:55,m:60,a:1.00},'3h':{v:130,m:180,a:1.00} },
  'Triciclo': { '10min':{v:12,m:10,a:1.00},'20min':{v:22,m:20,a:1.00},'30min':{v:30,m:30,a:1.00},
               '40min':{v:40,m:40,a:1.00},'60min':{v:55,m:60,a:1.00},'3h':{v:130,m:180,a:1.00} },
  'Pelúcia': { '10min':{v:15,m:10,a:1.20},'20min':{v:25,m:20,a:1.20},'30min':{v:35,m:30,a:1.20},
               '40min':{v:45,m:40,a:1.20},'60min':{v:65,m:60,a:1.20},'3h':{v:150,m:180,a:1.20} }
};

const PLANO_LABELS = { '10min':'10 minutos','20min':'20 minutos','30min':'30 minutos',
                        '40min':'40 minutos','60min':'1 hora','3h':'3 horas' };

let sessions = [];
let statsHoje = { fat: 0, n: 0 };
