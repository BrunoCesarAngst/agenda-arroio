<template>
  <div class="admin-dashboard">
    <h1 class="text-2xl font-bold mb-6">Painel Administrativo</h1>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <!-- Card de Estatísticas -->
      <div class="bg-white p-6 rounded-lg shadow-md">
        <h2 class="text-lg font-semibold mb-4">Estatísticas</h2>
        <div class="space-y-2">
          <p>Total de Usuários: {{ stats.totalUsers }}</p>
          <p>Eventos Ativos: {{ stats.activeEvents }}</p>
          <p>Eventos Pendentes: {{ stats.pendingEvents }}</p>
        </div>
      </div>

      <!-- Card de Ações Rápidas -->
      <div class="bg-white p-6 rounded-lg shadow-md">
        <h2 class="text-lg font-semibold mb-4">Ações Rápidas</h2>
        <div class="space-y-2">
          <button class="btn-primary w-full">Gerenciar Usuários</button>
          <button class="btn-secondary w-full">Configurações</button>
          <button class="btn-secondary w-full">Logs do Sistema</button>
        </div>
      </div>

      <!-- Card de Atividades Recentes -->
      <div class="bg-white p-6 rounded-lg shadow-md">
        <h2 class="text-lg font-semibold mb-4">Atividades Recentes</h2>
        <div class="space-y-2">
          <div v-for="activity in recentActivities" :key="activity.id" class="text-sm">
            <p>{{ activity.description }}</p>
            <span class="text-gray-500">{{ activity.timestamp }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'

const stats = ref({
  totalUsers: 0,
  activeEvents: 0,
  pendingEvents: 0
})

const recentActivities = ref([])

onMounted(async () => {
  // Aqui você implementará a lógica para buscar as estatísticas e atividades
  // do seu backend
})
</script>

<style scoped>
.admin-dashboard {
  @apply p-6;
}

.btn-primary {
  @apply bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors;
}

.btn-secondary {
  @apply bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 transition-colors;
}
</style>