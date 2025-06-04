import { getAnalytics, logEvent } from 'firebase/analytics';
import { initializeApp } from 'firebase/app';
import { addDoc, collection, getFirestore, serverTimestamp } from 'firebase/firestore';
import { alertService } from './alertService';

const LOG_LEVELS = {
  DEBUG: 'DEBUG',
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR',
  CRITICAL: 'CRITICAL'
};

const ENV_LOG_LEVELS = {
  development: [LOG_LEVELS.DEBUG, LOG_LEVELS.INFO, LOG_LEVELS.WARN, LOG_LEVELS.ERROR, LOG_LEVELS.CRITICAL],
  staging: [LOG_LEVELS.INFO, LOG_LEVELS.WARN, LOG_LEVELS.ERROR, LOG_LEVELS.CRITICAL],
  production: [LOG_LEVELS.WARN, LOG_LEVELS.ERROR, LOG_LEVELS.CRITICAL]
};

class Logger {
  constructor() {
    this.environment = import.meta.env.VITE_APP_ENV || 'development';
    this.analytics = null;
    this.db = null;
    this.initializeServices();
  }

  async initializeServices() {
    try {
      const app = initializeApp({
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
        authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
        storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
        appId: import.meta.env.VITE_FIREBASE_APP_ID,
        measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
      });

      this.analytics = getAnalytics(app);
      this.db = getFirestore(app);
    } catch (error) {
      console.error('Erro ao inicializar serviços de logging:', error);
    }
  }

  async log(level, message, data = {}) {
    if (!ENV_LOG_LEVELS[this.environment].includes(level)) {
      return;
    }

    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      environment: this.environment,
      data,
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    // Log no console para desenvolvimento
    if (this.environment === 'development' && import.meta.env.VITE_ENABLE_CONSOLE_LOGS === 'true') {
      console.log(`[${level}] ${message}`, data);
    }

    // Enviar para o Analytics
    if (this.analytics && import.meta.env.VITE_ENABLE_FIREBASE_LOGS === 'true') {
      logEvent(this.analytics, 'app_log', {
        level,
        message,
        environment: this.environment
      });
    }

    // Salvar no Firestore
    if (this.db && import.meta.env.VITE_ENABLE_FIREBASE_LOGS === 'true') {
      try {
        await addDoc(collection(this.db, 'logs'), {
          ...logEntry,
          createdAt: serverTimestamp()
        });
      } catch (error) {
        console.error('Erro ao salvar log no Firestore:', error);
      }
    }

    // Enviar alerta para níveis críticos
    if (level === LOG_LEVELS.CRITICAL && import.meta.env.VITE_ENABLE_SLACK_ALERTS === 'true') {
      await alertService.sendSlackAlert(logEntry);
    }
  }

  debug(message, data) {
    return this.log(LOG_LEVELS.DEBUG, message, data);
  }

  info(message, data) {
    return this.log(LOG_LEVELS.INFO, message, data);
  }

  warn(message, data) {
    return this.log(LOG_LEVELS.WARN, message, data);
  }

  error(message, data) {
    return this.log(LOG_LEVELS.ERROR, message, data);
  }

  critical(message, data) {
    return this.log(LOG_LEVELS.CRITICAL, message, data);
  }
}

export const logger = new Logger();