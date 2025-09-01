import { addDoc, collection, getDocs, getFirestore, query, serverTimestamp, where } from 'firebase/firestore';
import { logger } from './logger';

class MetricsService {
  constructor() {
    this.db = getFirestore();
    this.metricsCollection = 'metrics';
  }

  async trackMetric(name, data = {}) {
    try {
      const metricData = {
        name,
        data,
        timestamp: serverTimestamp(),
        environment: import.meta.env.VITE_APP_ENV
      };

      await addDoc(collection(this.db, this.metricsCollection), metricData);
      logger.debug(`Métrica registrada: ${name}`, data);
    } catch (error) {
      logger.error('Erro ao registrar métrica', { error, metric: name });
    }
  }

  async getMetrics(name, startDate, endDate) {
    try {
      const q = query(
        collection(this.db, this.metricsCollection),
        where('name', '==', name),
        where('timestamp', '>=', startDate),
        where('timestamp', '<=', endDate)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      logger.error('Erro ao buscar métricas', { error, metric: name });
      return [];
    }
  }

  // Métricas de Performance
  async trackPageLoad(pageName, loadTime) {
    await this.trackMetric('page_load', {
      page: pageName,
      loadTime,
      userAgent: navigator.userAgent
    });
  }

  async trackApiCall(endpoint, method, duration, status) {
    await this.trackMetric('api_call', {
      endpoint,
      method,
      duration,
      status,
      timestamp: new Date().toISOString()
    });
  }

  // Métricas de Usuário
  async trackUserAction(action, userId, details = {}) {
    await this.trackMetric('user_action', {
      action,
      userId,
      ...details,
      timestamp: new Date().toISOString()
    });
  }

  async trackUserSession(userId, sessionDuration) {
    await this.trackMetric('user_session', {
      userId,
      sessionDuration,
      timestamp: new Date().toISOString()
    });
  }

  // Métricas de Sistema
  async trackSystemHealth(component, status, details = {}) {
    await this.trackMetric('system_health', {
      component,
      status,
      ...details,
      timestamp: new Date().toISOString()
    });
  }

  async trackError(error, context = {}) {
    await this.trackMetric('system_error', {
      error: error.message,
      stack: error.stack,
      ...context,
      timestamp: new Date().toISOString()
    });
  }

  // Métricas de Negócio
  async trackAgendamento(agendamentoId, status, details = {}) {
    await this.trackMetric('agendamento', {
      agendamentoId,
      status,
      ...details,
      timestamp: new Date().toISOString()
    });
  }

  async trackEmpresa(empresaId, action, details = {}) {
    await this.trackMetric('empresa', {
      empresaId,
      action,
      ...details,
      timestamp: new Date().toISOString()
    });
  }
}

export const metricsService = new MetricsService();