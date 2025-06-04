<template>
  <div class="settings-page">
    <h1 class="text-2xl font-bold mb-6">Configurações do Sistema</h1>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Configurações Gerais -->
      <div class="bg-white p-6 rounded-lg shadow-md">
        <h2 class="text-lg font-semibold mb-4">Configurações Gerais</h2>
        <form @submit.prevent="saveGeneralSettings" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Nome do Sistema</label>
            <input v-model="settings.systemName" type="text" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Email de Suporte</label>
            <input v-model="settings.supportEmail" type="email" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Tempo Máximo de Sessão (minutos)</label>
            <input v-model="settings.sessionTimeout" type="number" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
          </div>
          <button type="submit" class="btn-primary w-full">
            Salvar Configurações
          </button>
        </form>
      </div>

      <!-- Configurações de Notificações -->
      <div class="bg-white p-6 rounded-lg shadow-md">
        <h2 class="text-lg font-semibold mb-4">Configurações de Notificações</h2>
        <form @submit.prevent="saveNotificationSettings" class="space-y-4">
          <div class="space-y-2">
            <label class="flex items-center">
              <input v-model="settings.notifications.email" type="checkbox" class="rounded border-gray-300" />
              <span class="ml-2">Ativar notificações por email</span>
            </label>
            <label class="flex items-center">
              <input v-model="settings.notifications.push" type="checkbox" class="rounded border-gray-300" />
              <span class="ml-2">Ativar notificações push</span>
            </label>
          </div>
          <button type="submit" class="btn-primary w-full">
            Salvar Notificações
          </button>
        </form>
      </div>

      <!-- Configurações de Backup -->
      <div class="bg-white p-6 rounded-lg shadow-md">
        <h2 class="text-lg font-semibold mb-4">Backup do Sistema</h2>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Frequência de Backup</label>
            <select v-model="settings.backup.frequency" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
              <option value="daily">Diário</option>
              <option value="weekly">Semanal</option>
              <option value="monthly">Mensal</option>
            </select>
          </div>
          <button @click="createBackup" class="btn-primary w-full">
            Criar Backup Agora
          </button>
          <button @click="restoreBackup" class="btn-secondary w-full">
            Restaurar Backup
          </button>
        </div>
      </div>

      <!-- Configurações de Segurança -->
      <div class="bg-white p-6 rounded-lg shadow-md">
        <h2 class="text-lg font-semibold mb-4">Configurações de Segurança</h2>
        <form @submit.prevent="saveSecuritySettings" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Tempo de Expiração de Senha (dias)</label>
            <input v-model="settings.security.passwordExpiration" type="number" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Tentativas Máximas de Login</label>
            <input v-model="settings.security.maxLoginAttempts" type="number" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
          </div>
          <button type="submit" class="btn-primary w-full">
            Salvar Segurança
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const settings = ref({
  systemName: '',
  supportEmail: '',
  sessionTimeout: 30,
  notifications: {
    email: true,
    push: false
  },
  backup: {
    frequency: 'daily'
  },
  security: {
    passwordExpiration: 90,
    maxLoginAttempts: 5
  }
})

const saveGeneralSettings = async () => {
  // Implementar lógica de salvamento
  console.log('Salvando configurações gerais:', settings.value)
}

const saveNotificationSettings = async () => {
  // Implementar lógica de salvamento
  console.log('Salvando configurações de notificações:', settings.value.notifications)
}

const saveSecuritySettings = async () => {
  // Implementar lógica de salvamento
  console.log('Salvando configurações de segurança:', settings.value.security)
}

const createBackup = async () => {
  // Implementar lógica de backup
  console.log('Criando backup do sistema')
}

const restoreBackup = async () => {
  // Implementar lógica de restauração
  console.log('Restaurando backup do sistema')
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