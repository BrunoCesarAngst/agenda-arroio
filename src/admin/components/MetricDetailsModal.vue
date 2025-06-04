<template>
  <div v-if="show" class="fixed inset-0 z-50 overflow-y-auto">
    <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
      <div class="fixed inset-0 transition-opacity" aria-hidden="true">
        <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
      </div>

      <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

      <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
        <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <div class="sm:flex sm:items-start">
            <div class="mt-3 text-center sm:mt-0 sm:text-left w-full">
              <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
                Detalhes da Métrica
              </h3>

              <div class="mt-2 space-y-4">
                <div v-if="metric">
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <p class="text-sm font-medium text-gray-500">ID</p>
                      <p class="mt-1 text-sm text-gray-900">{{ metric.id }}</p>
                    </div>
                    <div>
                      <p class="text-sm font-medium text-gray-500">Timestamp</p>
                      <p class="mt-1 text-sm text-gray-900">{{ formatDate(metric.timestamp) }}</p>
                    </div>
                  </div>

                  <div class="mt-4">
                    <p class="text-sm font-medium text-gray-500">Dados</p>
                    <pre class="mt-1 p-2 bg-gray-50 rounded text-sm text-gray-900 overflow-x-auto">{{ formatData(metric.data) }}</pre>
                  </div>

                  <div class="mt-4">
                    <p class="text-sm font-medium text-gray-500">Status</p>
                    <p class="mt-1 text-sm" :class="getStatusClass(metric)">
                      {{ getStatusText(metric) }}
                    </p>
                  </div>

                  <div v-if="metric.data.error" class="mt-4">
                    <p class="text-sm font-medium text-gray-500">Erro</p>
                    <pre class="mt-1 p-2 bg-red-50 rounded text-sm text-red-900 overflow-x-auto">{{ formatError(metric.data.error) }}</pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
          <button
            type="button"
            class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            @click="$emit('close')"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MetricDetailsModal',

  props: {
    show: {
      type: Boolean,
      required: true
    },
    metric: {
      type: Object,
      required: true
    }
  },

  setup() {
    const formatDate = (timestamp) => {
      return new Date(timestamp).toLocaleString();
    };

    const formatData = (data) => {
      return JSON.stringify(data, null, 2);
    };

    const formatError = (error) => {
      if (typeof error === 'string') return error;
      return JSON.stringify(error, null, 2);
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

    return {
      formatDate,
      formatData,
      formatError,
      getStatusClass,
      getStatusText
    };
  }
};
</script>