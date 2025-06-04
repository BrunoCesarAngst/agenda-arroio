import { config } from '@vue/test-utils';
import { getAnalytics } from 'firebase/analytics';
import { initializeApp } from 'firebase/app';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getPerformance } from 'firebase/performance';
import { getStorage } from 'firebase/storage';
import { createRouter, createWebHistory } from 'vue-router';

// Mock do Firebase
const firebaseConfig = {
  apiKey: 'test-api-key',
  authDomain: 'test-auth-domain',
  projectId: 'test-project-id',
  storageBucket: 'test-storage-bucket',
  messagingSenderId: 'test-messaging-sender-id',
  appId: 'test-app-id',
  measurementId: 'test-measurement-id'
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const analytics = getAnalytics(app);
const performance = getPerformance(app);
const appCheckConfig = {
  provider: new ReCaptchaV3Provider('test-recaptcha-key'),
  isTokenAutoRefreshEnabled: true
};
const appCheck = initializeAppCheck(app, appCheckConfig);

// Mock do router
const router = createRouter({
  history: createWebHistory(),
  routes: []
});

// Configuração global do Vue Test Utils
config.global.plugins = [router];
config.global.provide = {
  auth,
  db,
  storage,
  analytics,
  performance,
  appCheck
};

// Mock do window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock do ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));