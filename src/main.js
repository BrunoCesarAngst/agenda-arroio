import { getAnalytics } from 'firebase/analytics';
import { initializeApp } from 'firebase/app';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getPerformance } from 'firebase/performance';
import { getStorage } from 'firebase/storage';
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { logger } from './services/logger';
import { metricsService } from './services/metricsService';
import './style.css';

// Configuração do Firebase
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Inicialização do Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const performance = getPerformance(app);
const appCheckConfig = {
  provider: new ReCaptchaV3Provider(import.meta.env.VITE_RECAPTCHA_SITE_KEY),
  isTokenAutoRefreshEnabled: true
};
const appCheck = initializeAppCheck(app, appCheckConfig);

// Configuração do Vue
const vueApp = createApp(App);

// Registro de plugins e serviços
vueApp.use(router);
// vueApp.use(adminRouter);

// Registro de serviços globais
vueApp.provide('auth', auth);
vueApp.provide('db', db);
vueApp.provide('storage', storage);
vueApp.provide('analytics', analytics);
vueApp.provide('performance', performance);
vueApp.provide('appCheck', appCheck);
vueApp.provide('metricsService', metricsService);
vueApp.provide('logger', logger);

// Inicialização da aplicação
vueApp.mount('#app');

// Monitoramento de erros global
vueApp.config.errorHandler = (err, vm, info) => {
  logger.error('Erro global:', { error: err, info });
  metricsService.trackError('global', err);
};

// Monitoramento de performance
if (import.meta.env.PROD) {
  window.addEventListener('load', () => {
    const timing = window.performance.timing;
    const loadTime = timing.loadEventEnd - timing.navigationStart;
    metricsService.trackPageLoad('app', loadTime);
  });
}
