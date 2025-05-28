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
        <h2 class="text-2xl font-bold text-blue-800">Meus Serviços</h2>
        <button
          @click="mostrarModalNovoServico = true"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <span>➕</span>
          <span>Novo Serviço</span>
        </button>
      </div>

      <!-- Lista de Serviços -->
      <div class="bg-white p-6 rounded-xl shadow">
        <div v-if="loading" class="text-center py-4">
          <p class="text-gray-600">Carregando serviços...</p>
        </div>
        <div v-else-if="error" class="text-center py-4">
          <p class="text-red-600">{{ error }}</p>
        </div>
        <div v-else-if="servicos.length === 0" class="text-gray-500 text-center">
          Nenhum serviço cadastrado.
        </div>
        <div v-else class="space-y-4">
          <div v-for="servico in servicos" :key="servico.id" class="border-b pb-4 last:border-b-0 last:pb-0">
            <div class="flex justify-between items-start">
              <div>
                <h3 class="text-lg font-semibold text-blue-800">{{ servico.nome }}</h3>
                <p class="text-gray-600 mt-1">{{ servico.descricao }}</p>
                <div class="mt-2 flex items-center space-x-4">
                  <span class="text-green-600 font-semibold">R$ {{ servico.preco.toFixed(2) }}</span>
                  <span class="text-gray-500">{{ servico.duracao }} minutos</span>
                </div>
              </div>
              <div class="flex space-x-2">
                <button
                  @click="editarServico(servico)"
                  class="text-blue-600 hover:text-blue-800"
                >
                  ✏️
                </button>
                <button
                  @click="excluirServico(servico.id)"
                  class="text-red-600 hover:text-red-800"
                >
                  🗑️
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal de Novo Serviço -->
  <div v-if="mostrarModalNovoServico" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
    <div class="bg-white rounded-xl p-6 w-full max-w-md">
      <h3 class="text-xl font-bold text-blue-800 mb-4">{{ servicoEditando ? 'Editar Serviço' : 'Novo Serviço' }}</h3>

      <form @submit.prevent="salvarServico" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700">Nome do Serviço</label>
          <input
            v-model="formServico.nome"
            type="text"
            required
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Descrição</label>
          <textarea
            v-model="formServico.descricao"
            required
            rows="3"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          ></textarea>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Preço (R$)</label>
            <input
              v-model="formServico.preco"
              type="number"
              step="0.01"
              required
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">Duração (minutos)</label>
            <input
              v-model="formServico.duracao"
              type="number"
              required
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>

        <div class="flex justify-end space-x-3 mt-6">
          <button
            type="button"
            @click="mostrarModalNovoServico = false"
            class="px-4 py-2 text-gray-700 hover:text-gray-900"
          >
            Cancelar
          </button>
          <button
            type="submit"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {{ servicoEditando ? 'Salvar' : 'Criar' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { signOut } from 'firebase/auth'
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, getFirestore, orderBy, query, serverTimestamp, updateDoc, where } from 'firebase/firestore'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { auth } from '../../services/firebase'
import useAuthUser from '../../useAuthUser'

const router = useRouter()
const { user, userData } = useAuthUser()
const db = getFirestore()

// Dados da empresa
const empresa = ref(null)

// Serviços
const servicos = ref([])
const loading = ref(true)
const error = ref('')

// Modal e Formulário
const mostrarModalNovoServico = ref(false)
const servicoEditando = ref(null)
const formServico = ref({
  nome: '',
  descricao: '',
  preco: '',
  duracao: ''
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
  } catch (err) {
    console.error('Erro ao carregar dados da empresa:', err)
    error.value = 'Erro ao carregar dados da empresa'
  }
}

async function carregarServicos() {
  try {
    if (!userData.value?.empresaId) {
      throw new Error('Empresa não encontrada')
    }
    const servicosRef = collection(db, 'servicos')
    const q = query(servicosRef, where('empresaId', '==', userData.value.empresaId), orderBy('nome'))
    const querySnapshot = await getDocs(q)
    servicos.value = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  } catch (err) {
    console.error('Erro ao carregar serviços:', err)
    error.value = 'Erro ao carregar serviços'
  }
}

function editarServico(servico) {
  servicoEditando.value = servico
  formServico.value = { ...servico }
  mostrarModalNovoServico.value = true
}

async function excluirServico(id) {
  if (confirm('Tem certeza que deseja excluir este serviço?')) {
    try {
      await deleteDoc(doc(db, 'servicos', id))
      await carregarServicos()
    } catch (err) {
      console.error('Erro ao excluir serviço:', err)
      error.value = 'Erro ao excluir serviço'
    }
  }
}

async function salvarServico() {
  try {
    if (!userData.value?.empresaId) {
      throw new Error('Empresa não encontrada')
    }
    const dados = {
      nome: formServico.value.nome,
      descricao: formServico.value.descricao,
      preco: parseFloat(formServico.value.preco),
      duracao: parseInt(formServico.value.duracao),
      empresaId: userData.value.empresaId,
      ativo: true,
      criadoEm: serverTimestamp(),
      emoji: formServico.value.emoji || '💇'
    }
    if (servicoEditando.value) {
      await updateDoc(doc(db, 'servicos', servicoEditando.value.id), dados)
    } else {
      await addDoc(collection(db, 'servicos'), dados)
    }
    mostrarModalNovoServico.value = false
    servicoEditando.value = null
    formServico.value = {
      nome: '',
      descricao: '',
      preco: '',
      duracao: ''
    }
    await carregarServicos()
  } catch (err) {
    console.error('Erro ao salvar serviço:', err)
    error.value = 'Erro ao salvar serviço'
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
    await Promise.all([
      carregarDadosEmpresa(),
      carregarServicos()
    ])
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