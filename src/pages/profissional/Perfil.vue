<template>
  <header class="bg-gradient-to-r from-blue-800 to-blue-600 text-white p-6 rounded-b-3xl shadow-xl mb-4">
    <div class="max-w-7xl mx-auto">
      <!-- Informações da Empresa -->
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center space-x-6">
          <!-- Logo/Ícone da Empresa -->
          <div class="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm">
            <span class="text-3xl">🏢</span>
          </div>

          <!-- Informações da Empresa -->
          <div>
            <h1 class="text-2xl font-bold tracking-tight">{{ empresa?.nome || 'Carregando...' }}</h1>
            <div class="mt-2 space-y-1">
              <p class="text-blue-100 text-sm flex items-center">
                <span class="mr-2">📍</span>
                {{ empresa?.endereco }}
              </p>
              <p class="text-blue-100 text-sm flex items-center">
                <span class="mr-2">📝</span>
                {{ empresa?.descricao }}
              </p>
            </div>
          </div>
        </div>

        <!-- Botão Sair -->
        <button
          @click="logout"
          class="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl backdrop-blur-sm transition-all duration-200 flex items-center space-x-2"
        >
          <span>Sair</span>
          <span>🚪</span>
        </button>
      </div>

      <!-- Navegação -->
      <nav class="flex items-center space-x-4 border-t border-blue-500/30 pt-4">
        <router-link
          to="/dashboard-empresa"
          class="px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2"
          :class="[$route.path === '/dashboard-empresa' ? 'bg-white/20 text-white' : 'text-blue-100 hover:bg-white/10']"
        >
          <span>📊</span>
          <span>Dashboard</span>
        </router-link>

        <router-link
          to="/agendamentos"
          class="px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2"
          :class="[$route.path === '/agendamentos' ? 'bg-white/20 text-white' : 'text-blue-100 hover:bg-white/10']"
        >
          <span>📅</span>
          <span>Agendamentos</span>
        </router-link>

        <router-link
          to="/servicos"
          class="px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2"
          :class="[$route.path === '/servicos' ? 'bg-white/20 text-white' : 'text-blue-100 hover:bg-white/10']"
        >
          <span>💇</span>
          <span>Serviços</span>
        </router-link>

        <router-link
          to="/promocoes"
          class="px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2"
          :class="[$route.path === '/promocoes' ? 'bg-white/20 text-white' : 'text-blue-100 hover:bg-white/10']"
        >
          <span>🎁</span>
          <span>Promoções</span>
        </router-link>

        <router-link
          to="/perfil"
          class="px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2"
          :class="[$route.path === '/perfil' ? 'bg-white/20 text-white' : 'text-blue-100 hover:bg-white/10']"
        >
          <span>👤</span>
          <span>Perfil</span>
        </router-link>
      </nav>
    </div>
  </header>

  <div class="min-h-screen bg-gradient-to-b from-blue-50 to-white pt-8 flex flex-col items-center">
    <div class="w-full max-w-3xl space-y-8">
      <!-- Cabeçalho da Página -->
      <div class="flex justify-between items-center">
        <h2 class="text-2xl font-bold text-blue-800">Configurações do Perfil</h2>
        <button
          v-if="!editando"
          @click="iniciarEdicao"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <span>✏️</span>
          <span>Editar Perfil</span>
        </button>
      </div>

      <!-- Formulário de Perfil -->
      <div class="bg-white p-6 rounded-xl shadow">
        <div v-if="loading" class="text-center py-4">
          <p class="text-gray-600">Carregando dados...</p>
        </div>
        <div v-else-if="error" class="text-center py-4">
          <p class="text-red-600">{{ error }}</p>
        </div>
        <form v-else @submit.prevent="salvarPerfil" class="space-y-6">
          <!-- Informações Básicas -->
          <div class="space-y-4">
            <h3 class="text-lg font-semibold text-blue-800">Informações Básicas</h3>

            <div>
              <label class="block text-sm font-medium text-gray-700">Nome da Empresa</label>
              <input
                v-model="formEmpresa.nome"
                type="text"
                required
                :disabled="!editando"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Descrição</label>
              <textarea
                v-model="formEmpresa.descricao"
                required
                rows="3"
                :disabled="!editando"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100"
              ></textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Endereço</label>
              <input
                v-model="formEmpresa.endereco"
                type="text"
                required
                :disabled="!editando"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>
          </div>

          <!-- Contato -->
          <div class="space-y-4">
            <h3 class="text-lg font-semibold text-blue-800">Contato</h3>

            <div>
              <label class="block text-sm font-medium text-gray-700">Telefone</label>
              <input
                v-model="formEmpresa.telefone"
                type="tel"
                required
                :disabled="!editando"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Email</label>
              <input
                v-model="formEmpresa.email"
                type="email"
                required
                :disabled="!editando"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>
          </div>

          <!-- Horário de Funcionamento -->
          <div class="space-y-4">
            <h3 class="text-lg font-semibold text-blue-800">Horário de Funcionamento</h3>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">Abertura</label>
                <input
                  v-model="formEmpresa.horarioAbertura"
                  type="time"
                  required
                  :disabled="!editando"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">Fechamento</label>
                <input
                  v-model="formEmpresa.horarioFechamento"
                  type="time"
                  required
                  :disabled="!editando"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>
            </div>
          </div>

          <!-- Botões de Ação -->
          <div v-if="editando" class="flex justify-end space-x-3">
            <button
              type="button"
              @click="cancelarEdicao"
              class="px-4 py-2 text-gray-700 hover:text-gray-900"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Salvar Alterações
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { signOut } from 'firebase/auth'
import { doc, getDoc, getFirestore, updateDoc } from 'firebase/firestore'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { auth } from '../../services/firebase'
import useAuthUser from '../../useAuthUser'

const router = useRouter()
const { user, userData } = useAuthUser()
const db = getFirestore()

// Dados da empresa
const empresa = ref(null)
const loading = ref(true)
const error = ref('')
const editando = ref(false)

// Formulário
const formEmpresa = ref({
  nome: '',
  descricao: '',
  endereco: '',
  telefone: '',
  email: '',
  horarioAbertura: '',
  horarioFechamento: ''
})

async function carregarDadosEmpresa() {
  try {
    if (!userData.value?.empresaId) {
      throw new Error('Empresa não encontrada')
    }

    const empresaDoc = await getDoc(doc(db, 'empresas', userData.value.empresaId))
    if (!empresaDoc.exists()) {
      throw new Error('Empresa não encontrada')
    }

    empresa.value = empresaDoc.data()
    formEmpresa.value = { ...empresaDoc.data() }
  } catch (err) {
    console.error('Erro ao carregar dados da empresa:', err)
    error.value = 'Erro ao carregar dados da empresa'
  }
}

function iniciarEdicao() {
  editando.value = true
}

function cancelarEdicao() {
  formEmpresa.value = { ...empresa.value }
  editando.value = false
}

async function salvarPerfil() {
  try {
    if (!userData.value?.empresaId) {
      throw new Error('Empresa não encontrada')
    }

    await updateDoc(doc(db, 'empresas', userData.value.empresaId), formEmpresa.value)
    empresa.value = { ...formEmpresa.value }
    editando.value = false
  } catch (err) {
    console.error('Erro ao salvar dados:', err)
    error.value = 'Erro ao salvar dados'
  }
}

function logout() {
  signOut(auth)
  router.push('/login')
}

onMounted(async () => {
  try {
    loading.value = true
    error.value = ''
    await carregarDadosEmpresa()
  } catch (err) {
    console.error('Erro ao carregar dados:', err)
    error.value = 'Erro ao carregar dados'
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.bg-gradient-to-b {
  min-height: 100vh;
}
.pt-8 {
  padding-top: 2rem;
}
</style>