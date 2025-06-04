<template>
  <div class="relative">
    <canvas ref="chartCanvas"></canvas>
  </div>
</template>

<script>
import Chart from 'chart.js/auto';
import { onMounted, ref, watch } from 'vue';

export default {
  name: 'MetricsChart',

  props: {
    metrics: {
      type: Array,
      required: true
    },
    type: {
      type: String,
      default: 'line',
      validator: (value) => ['line', 'bar', 'pie'].includes(value)
    },
    metricType: {
      type: String,
      required: true
    }
  },

  setup(props) {
    const chartCanvas = ref(null);
    let chart = null;

    const createChart = () => {
      if (chart) {
        chart.destroy();
      }

      const ctx = chartCanvas.value.getContext('2d');
      const data = prepareChartData();

      chart = new Chart(ctx, {
        type: props.type,
        data: data,
        options: getChartOptions()
      });
    };

    const prepareChartData = () => {
      const labels = [];
      const datasets = [];

      switch (props.metricType) {
        case 'page_load':
          return preparePageLoadData();
        case 'api_call':
          return prepareApiCallData();
        case 'user_action':
          return prepareUserActionData();
        case 'system_health':
          return prepareSystemHealthData();
        default:
          return prepareDefaultData();
      }
    };

    const preparePageLoadData = () => {
      const data = props.metrics.reduce((acc, metric) => {
        const date = new Date(metric.timestamp).toLocaleDateString();
        if (!acc[date]) {
          acc[date] = {
            count: 0,
            totalTime: 0
          };
        }
        acc[date].count++;
        acc[date].totalTime += metric.data.loadTime || 0;
        return acc;
      }, {});

      return {
        labels: Object.keys(data),
        datasets: [
          {
            label: 'Tempo Médio de Carregamento (ms)',
            data: Object.values(data).map(d => d.totalTime / d.count),
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1
          },
          {
            label: 'Número de Carregamentos',
            data: Object.values(data).map(d => d.count),
            borderColor: 'rgb(255, 99, 132)',
            tension: 0.1
          }
        ]
      };
    };

    const prepareApiCallData = () => {
      const data = props.metrics.reduce((acc, metric) => {
        const date = new Date(metric.timestamp).toLocaleDateString();
        if (!acc[date]) {
          acc[date] = {
            success: 0,
            error: 0
          };
        }
        if (metric.data.status >= 400) {
          acc[date].error++;
        } else {
          acc[date].success++;
        }
        return acc;
      }, {});

      return {
        labels: Object.keys(data),
        datasets: [
          {
            label: 'Chamadas com Sucesso',
            data: Object.values(data).map(d => d.success),
            backgroundColor: 'rgba(75, 192, 192, 0.5)'
          },
          {
            label: 'Chamadas com Erro',
            data: Object.values(data).map(d => d.error),
            backgroundColor: 'rgba(255, 99, 132, 0.5)'
          }
        ]
      };
    };

    const prepareUserActionData = () => {
      const data = props.metrics.reduce((acc, metric) => {
        const action = metric.data.action;
        if (!acc[action]) {
          acc[action] = 0;
        }
        acc[action]++;
        return acc;
      }, {});

      return {
        labels: Object.keys(data),
        datasets: [
          {
            data: Object.values(data),
            backgroundColor: [
              'rgba(255, 99, 132, 0.5)',
              'rgba(54, 162, 235, 0.5)',
              'rgba(255, 206, 86, 0.5)',
              'rgba(75, 192, 192, 0.5)',
              'rgba(153, 102, 255, 0.5)'
            ]
          }
        ]
      };
    };

    const prepareSystemHealthData = () => {
      const data = props.metrics.reduce((acc, metric) => {
        const date = new Date(metric.timestamp).toLocaleDateString();
        if (!acc[date]) {
          acc[date] = {
            cpu: [],
            memory: []
          };
        }
        if (metric.data.cpu) acc[date].cpu.push(metric.data.cpu);
        if (metric.data.memory) acc[date].memory.push(metric.data.memory);
        return acc;
      }, {});

      return {
        labels: Object.keys(data),
        datasets: [
          {
            label: 'Uso de CPU (%)',
            data: Object.values(data).map(d =>
              d.cpu.length ? d.cpu.reduce((a, b) => a + b, 0) / d.cpu.length : 0
            ),
            borderColor: 'rgb(255, 99, 132)',
            tension: 0.1
          },
          {
            label: 'Uso de Memória (%)',
            data: Object.values(data).map(d =>
              d.memory.length ? d.memory.reduce((a, b) => a + b, 0) / d.memory.length : 0
            ),
            borderColor: 'rgb(54, 162, 235)',
            tension: 0.1
          }
        ]
      };
    };

    const prepareDefaultData = () => {
      const data = props.metrics.reduce((acc, metric) => {
        const date = new Date(metric.timestamp).toLocaleDateString();
        if (!acc[date]) {
          acc[date] = 0;
        }
        acc[date]++;
        return acc;
      }, {});

      return {
        labels: Object.keys(data),
        datasets: [
          {
            label: 'Contagem',
            data: Object.values(data),
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1
          }
        ]
      };
    };

    const getChartOptions = () => {
      const baseOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top'
          },
          title: {
            display: true,
            text: getChartTitle()
          }
        }
      };

      if (props.type === 'line' || props.type === 'bar') {
        return {
          ...baseOptions,
          scales: {
            y: {
              beginAtZero: true
            }
          }
        };
      }

      return baseOptions;
    };

    const getChartTitle = () => {
      const titles = {
        page_load: 'Métricas de Carregamento de Páginas',
        api_call: 'Métricas de Chamadas de API',
        user_action: 'Distribuição de Ações de Usuário',
        system_health: 'Métricas de Saúde do Sistema'
      };
      return titles[props.metricType] || 'Métricas';
    };

    onMounted(() => {
      createChart();
    });

    watch(() => props.metrics, () => {
      createChart();
    }, { deep: true });

    watch(() => props.type, () => {
      createChart();
    });

    watch(() => props.metricType, () => {
      createChart();
    });

    return {
      chartCanvas
    };
  }
};
</script>