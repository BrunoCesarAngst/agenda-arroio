<template>
  <div class="user-management">
    <h1 class="text-2xl font-bold mb-6">Gerenciamento de Usuários</h1>

    <!-- Barra de Pesquisa e Filtros -->
    <div class="mb-6 flex gap-4">
      <input
        type="text"
        v-model="searchQuery"
        placeholder="Pesquisar usuários..."
        class="flex-1 p-2 border rounded"
      />
      <select v-model="roleFilter" class="p-2 border rounded">
        <option value="">Todos os papéis</option>
        <option value="admin">Administrador</option>
        <option value="user">Usuário</option>
      </select>
    </div>

    <!-- Tabela de Usuários -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <table class="min-w-full">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Nome
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Email
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Papel
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Ações
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="user in filteredUsers" :key="user.id">
            <td class="px-6 py-4 whitespace-nowrap">
              {{ user.name }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              {{ user.email }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span :class="getRoleBadgeClass(user.role)">
                {{ user.role }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span :class="getStatusBadgeClass(user.status)">
                {{ user.status }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <button @click="editUser(user)" class="text-blue-600 hover:text-blue-900 mr-3">
                Editar
              </button>
              <button @click="deleteUser(user)" class="text-red-600 hover:text-red-900">
                Excluir
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal de Edição -->
    <div v-if="showEditModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div class="bg-white p-6 rounded-lg w-full max-w-md">
        <h2 class="text-xl font-bold mb-4">Editar Usuário</h2>
        <form @submit.prevent="saveUser">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Nome</label>
              <input v-model="editingUser.name" type="text" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Email</label>
              <input v-model="editingUser.email" type="email" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Papel</label>
              <select v-model="editingUser.role" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                <option value="admin">Administrador</option>
                <option value="user">Usuário</option>
              </select>
            </div>
          </div>
          <div class="mt-6 flex justify-end space-x-3">
            <button type="button" @click="showEditModal = false" class="btn-secondary">
              Cancelar
            </button>
            <button type="submit" class="btn-primary">
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const users = ref([])
const searchQuery = ref('')
const roleFilter = ref('')
const showEditModal = ref(false)
const editingUser = ref(null)

const filteredUsers = computed(() => {
  return users.value.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesRole = !roleFilter.value || user.role === roleFilter.value
    return matchesSearch && matchesRole
  })
})

const getRoleBadgeClass = (role) => {
  return {
    'px-2 py-1 text-xs rounded-full': true,
    'bg-blue-100 text-blue-800': role === 'admin',
    'bg-gray-100 text-gray-800': role === 'user'
  }
}

const getStatusBadgeClass = (status) => {
  return {
    'px-2 py-1 text-xs rounded-full': true,
    'bg-green-100 text-green-800': status === 'active',
    'bg-red-100 text-red-800': status === 'inactive'
  }
}

const editUser = (user) => {
  editingUser.value = { ...user }
  showEditModal.value = true
}

const saveUser = async () => {
  // Implementar lógica de salvamento
  showEditModal.value = false
}

const deleteUser = async (user) => {
  if (confirm(`Tem certeza que deseja excluir o usuário ${user.name}?`)) {
    // Implementar lógica de exclusão
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