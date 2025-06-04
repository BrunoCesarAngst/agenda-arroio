<template>
  <div class="system-logs">
    <h1 class="text-2xl font-bold mb-6">Logs do Sistema</h1>

    <!-- Filtros -->
    <div class="mb-6 flex gap-4">
      <div class="flex-1">
        <input
          type="text"
          v-model="searchQuery"
          placeholder="Pesquisar nos logs..."
          class="w-full p-2 border rounded"
        />
      </div>
      <select v-model="logLevel" class="p-2 border rounded">
        <option value="">Todos os níveis</option>
        <option value="error">Erro</option>
        <option value="warning">Aviso</option>
        <option value="info">Info</option>
        <option value="debug">Debug</option>
      </select>
      <input
        type="date"
        v-model="dateFilter"
        class="p-2 border rounded"
      />
    </div>

    <!-- Tabela de Logs -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <table class="min-w-full">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Data/Hora
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Nível
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Mensagem
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Usuário
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Ações
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="log in filteredLogs" :key="log.id">
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ formatDate(log.timestamp) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span :class="getLogLevelClass(log.level)">
                {{ log.level }}
              </span>
            </td>
            <td class="px-6 py-4 text-sm text-gray-500">
              {{ log.message }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ log.user }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <button @click="showLogDetails(log)" class="text-blue-600 hover:text-blue-900">
                Detalhes
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Paginação -->
    <div class="mt-4 flex justify-between items-center">
      <div class="text-sm text-gray-500">
        Mostrando {{ paginationInfo.start }} - {{ paginationInfo.end }} de {{ paginationInfo.total }}
      </div>
      <div class="flex gap-2">
        <button
          @click="previousPage"
          :disabled="currentPage === 1"
          class="btn-secondary"
        >
          Anterior
        </button>
        <button
          @click="nextPage"
          :disabled="currentPage >= totalPages"
          class="btn-secondary"
        >
          Próxima
        </button>
      </div>
    </div>

    <!-- Modal de Detalhes -->
    <div v-if="showDetailsModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div class="bg-white p-6 rounded-lg w-full max-w-2xl">
        <h2 class="text-xl font-bold mb-4">Detalhes do Log</h2>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Data/Hora</label>
            <p class="mt-1">{{ formatDate(selectedLog.timestamp) }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Nível</label>
            <p class="mt-1">{{ selectedLog.level }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Mensagem</label>
            <p class="mt-1">{{ selectedLog.message }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Usuário</label>
            <p class="mt-1">{{ selectedLog.user }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Detalhes Técnicos</label>
            <pre class="mt-1 bg-gray-100 p-4 rounded overflow-x-auto">{{ selectedLog.details }}</pre>
          </div>
        </div>
        <div class="mt-6 flex justify-end">
          <button @click="showDetailsModal = false" class="btn-secondary">
            Fechar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const logs = ref([])
const searchQuery = ref('')
const logLevel = ref('')
const dateFilter = ref('')
const currentPage = ref(1)
const itemsPerPage = 10
const showDetailsModal = ref(false)
const selectedLog = ref(null)

const filteredLogs = computed(() => {
  return logs.value.filter(log => {
    const matchesSearch = log.message.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                         log.user.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesLevel = !logLevel.value || log.level === logLevel.value
    const matchesDate = !dateFilter.value || log.timestamp.startsWith(dateFilter.value)
    return matchesSearch && matchesLevel && matchesDate
  })
})

const paginationInfo = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage + 1
  const end = Math.min(start + itemsPerPage - 1, filteredLogs.value.length)
  return {
    start,
    end,
    total: filteredLogs.value.length
  }
})

const totalPages = computed(() => {
  return Math.ceil(filteredLogs.value.length / itemsPerPage)
})

const getLogLevelClass = (level) => {
  return {
    'px-2 py-1 text-xs rounded-full': true,
    'bg-red-100 text-red-800': level === 'error',
    'bg-yellow-100 text-yellow-800': level === 'warning',
    'bg-blue-100 text-blue-800': level === 'info',
    'bg-gray-100 text-gray-800': level === 'debug'
  }
}

const formatDate = (date) => {
  return new Date(date).toLocaleString()
}

const showLogDetails = (log) => {
  selectedLog.value = log
  showDetailsModal.value = true
}

const previousPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}
</script>

<style scoped>
.btn-primary {
  @apply bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors;
}

.btn-secondary {
  @apply bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 transition-colors;
}
</style>