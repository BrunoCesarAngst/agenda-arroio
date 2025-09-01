<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-6">Dashboard de Métricas</h1>

    <!-- Filtros -->
    <div class="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <label class="block text-sm font-medium text-gray-700">Tipo de Métrica</label>
        <select
          v-model="selectedMetric"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        >
          <option value="page_load">Carregamento de Páginas</option>
          <option value="api_call">Chamadas de API</option>
          <option value="user_action">Ações de Usuário</option>
          <option value="user_session">Sessões de Usuário</option>
          <option value="system_health">Saúde do Sistema</option>
          <option value="system_error">Erros do Sistema</option>
          <option value="agendamento">Agendamentos</option>
          <option value="empresa">Empresas</option>
        </select>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700">Data Inicial</label>
        <input
          type="date"
          v-model="startDate"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        >
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700">Data Final</label>
        <input
          type="date"
          v-model="endDate"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        >
      </div>
    </div>

    <!-- Cards de Resumo -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div class="bg-white p-4 rounded-lg shadow">
        <h3 class="text-lg font-semibold text-gray-700">Total de Registros</h3>
        <p class="text-2xl font-bold text-indigo-600">{{ metrics.length }}</p>
      </div>
      <div class="bg-white p-4 rounded-lg shadow">
        <h3 class="text-lg font-semibold text-gray-700">Média de Tempo</h3>
        <p class="text-2xl font-bold text-indigo-600">{{ averageTime }}ms</p>
      </div>
      <div class="bg-white p-4 rounded-lg shadow">
        <h3 class="text-lg font-semibold text-gray-700">Taxa de Erro</h3>
        <p class="text-2xl font-bold text-indigo-600">{{ errorRate }}%</p>
      </div>
      <div class="bg-white p-4 rounded-lg shadow">
        <h3 class="text-lg font-semibold text-gray-700">Usuários Únicos</h3>
        <p class="text-2xl font-bold text-indigo-600">{{ uniqueUsers }}</p>
      </div>
    </div>

    <!-- Gráfico -->
    <div class="bg-white p-4 rounded-lg shadow mb-6">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-semibold text-gray-700">Tendência</h3>
        <div class="flex space-x-2">
          <button
            v-for="type in chartTypes"
            :key="type.value"
            @click="selectedChartType = type.value"
            :class="[
              'px-3 py-1 rounded-md text-sm font-medium',
              selectedChartType === type.value
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            ]"
          >
            {{ type.label }}
          </button>
        </div>
      </div>
      <div class="h-64">
        <MetricsChart
          :metrics="metrics"
          :type="selectedChartType"
          :metric-type="selectedMetric"
        />
      </div>
    </div>

    <!-- Tabela de Dados -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Detalhes</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="metric in metrics" :key="metric.id">
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ formatDate(metric.timestamp) }}
            </td>
            <td class="px-6 py-4 text-sm text-gray-500">
              {{ formatDetails(metric.data) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span :class="getStatusClass(metric)">
                {{ getStatusText(metric) }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              <button
                @click="showDetails(metric)"
                class="text-indigo-600 hover:text-indigo-900"
              >
                Detalhes
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <MetricDetailsModal
      :show="showDetailsModal"
      :metric="selectedMetric"
      @close="closeDetailsModal"
    />
  </div>
</template>

<script>
import { metricsService } from '@/services/metricsService';
import { computed, onMounted, ref } from 'vue';
import MetricDetailsModal from './MetricDetailsModal.vue';
import MetricsChart from './MetricsChart.vue';

export default {
  name: 'MetricsDashboard',

  components: {
    MetricDetailsModal,
    MetricsChart
  },

  setup() {
    const selectedMetric = ref('page_load');
    const startDate = ref(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    const endDate = ref(new Date().toISOString().split('T')[0]);
    const metrics = ref([]);
    const showDetailsModal = ref(false);
    const selectedChartType = ref('line');
    const chartTypes = [
      { label: 'Linha', value: 'line' },
      { label: 'Barra', value: 'bar' },
      { label: 'Pizza', value: 'pie' }
    ];

    const loadMetrics = async () => {
      metrics.value = await metricsService.getMetrics(
        selectedMetric.value,
        new Date(startDate.value),
        new Date(endDate.value)
      );
    };

    const averageTime = computed(() => {
      if (!metrics.value.length) return 0;
      const times = metrics.value
        .filter(m => m.data.loadTime || m.data.duration)
        .map(m => m.data.loadTime || m.data.duration);
      return Math.round(times.reduce((a, b) => a + b, 0) / times.length);
    });

    const errorRate = computed(() => {
      if (!metrics.value.length) return 0;
      const errors = metrics.value.filter(m =>
        m.data.status >= 400 || m.data.status === 'error'
      ).length;
      return Math.round((errors / metrics.value.length) * 100);
    });

    const uniqueUsers = computed(() => {
      const users = new Set(metrics.value.map(m => m.data.userId).filter(Boolean));
      return users.size;
    });

    const formatDate = (timestamp) => {
      return new Date(timestamp).toLocaleString();
    };

    const formatDetails = (data) => {
      if (data.page) return `Página: ${data.page}`;
      if (data.endpoint) return `API: ${data.endpoint}`;
      if (data.action) return `Ação: ${data.action}`;
      return JSON.stringify(data);
    };

    const getStatusClass = (metric) => {
      const status = metric.data.status;
      if (status >= 400 || status === 'error') return 'text-red-600';
      if (status >= 300) return 'text-yellow-600';
      return 'text-green-600';
    };

    const getStatusText = (metric) => {
      const status = metric.data.status;
      if (status >= 400 || status === 'error') return 'Erro';
      if (status >= 300) return 'Aviso';
      return 'Sucesso';
    };

    const showDetails = (metric) => {
      selectedMetric.value = metric;
      showDetailsModal.value = true;
    };

    const closeDetailsModal = () => {
      showDetailsModal.value = false;
      selectedMetric.value = null;
    };

    onMounted(() => {
      loadMetrics();
    });

    return {
      selectedMetric,
      startDate,
      endDate,
      metrics,
      averageTime,
      errorRate,
      uniqueUsers,
      formatDate,
      formatDetails,
      getStatusClass,
      getStatusText,
      showDetails,
      showDetailsModal,
      closeDetailsModal,
      selectedChartType,
      chartTypes
    };
  }
};
</script>