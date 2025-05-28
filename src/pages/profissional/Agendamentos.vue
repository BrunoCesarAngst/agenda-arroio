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
      <div class="bg-white p-6 rounded-xl shadow">
        <h3 class="text-lg font-bold mb-4 text-blue-700">Agendamentos Recebidos</h3>
        <div v-if="loading" class="text-center py-4">
          <p class="text-gray-600">Carregando agendamentos...</p>
        </div>
        <div v-else-if="error" class="text-center py-4">
          <p class="text-red-600">{{ error }}</p>
        </div>
        <div v-else-if="agendamentos.length === 0" class="text-blue-700 text-center py-8">
          <p class="text-lg font-semibold">Nenhum agendamento encontrado.</p>
          <p class="text-gray-500 mt-2">Quando um cliente realizar um agendamento, ele aparecerá aqui!</p>
        </div>
        <div v-else class="space-y-3">
          <div v-for="ag in agendamentos" :key="ag.id" class="border-b pb-2 last:border-b-0 last:pb-0 flex justify-between items-center">
            <div>
              <p class="font-semibold">{{ ag.servico }}</p>
              <p class="text-sm text-gray-600">Cliente: {{ ag.cliente }}</p>
              <p class="text-sm text-gray-600">Data: {{ formatDate(ag.data) }} - {{ ag.hora }}</p>
              <p class="text-xs text-gray-500">Status: <span :class="statusClass(ag.status)">{{ ag.status }}</span></p>
            </div>
            <div class="flex space-x-2">
              <button v-if="ag.status === 'pendente'" class="text-green-600 hover:underline text-xs" @click="confirmarAgendamento(ag.id)">
                Confirmar
              </button>
              <button v-if="ag.status === 'pendente'" class="text-red-600 hover:underline text-xs" @click="cancelarAgendamento(ag.id)">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { signOut } from 'firebase/auth'
import { collection, doc, getDoc, getDocs, getFirestore, orderBy, query, updateDoc, where } from 'firebase/firestore'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { auth } from '../../services/firebase'
import useAuthUser from '../../useAuthUser'
import { formatDate } from '../../utils'

const router = useRouter()
const { user, userData } = useAuthUser()
const db = getFirestore()

// Dados da empresa
const empresa = ref(null)

// Agendamentos
const agendamentos = ref([])
const loading = ref(true)
const error = ref('')

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

async function carregarAgendamentos() {
  try {
    if (!userData.value?.empresaId) {
      throw new Error('Empresa não encontrada')
    }

    // Busca agendamentos da empresa
    const agendamentosRef = collection(db, 'agendamentos')
    const q = query(
      agendamentosRef,
      where('empresaId', '==', userData.value.empresaId),
      orderBy('data', 'desc'),
      orderBy('hora', 'desc')
    )

    const querySnapshot = await getDocs(q)
    const agendamentosData = []

    // Processa cada agendamento
    for (const doc of querySnapshot.docs) {
      const agendamento = doc.data()

      // Busca dados do serviço
      const servicoDoc = await getDoc(doc(db, 'servicos', agendamento.servicoId))
      const servico = servicoDoc.exists() ? servicoDoc.data() : null

      // Busca dados do cliente
      const clienteDoc = await getDoc(doc(db, 'usuarios', agendamento.clienteId))
      const cliente = clienteDoc.exists() ? clienteDoc.data() : null

      agendamentosData.push({
        id: doc.id,
        servico: servico?.nome || 'Serviço não encontrado',
        cliente: cliente?.nome || 'Cliente não encontrado',
        data: agendamento.data,
        hora: agendamento.hora,
        status: agendamento.status
      })
    }

    agendamentos.value = agendamentosData
  } catch (err) {
    console.error('Nenhum agendamento encontrado.:', err)
    error.value = 'Nenhum agendamento encontrado.'
  }
}

async function confirmarAgendamento(id) {
  try {
    const agendamentoRef = doc(db, 'agendamentos', id)
    await updateDoc(agendamentoRef, {
      status: 'confirmado'
    })

    // Atualiza o status localmente
    const index = agendamentos.value.findIndex(a => a.id === id)
    if (index !== -1) {
      agendamentos.value[index].status = 'confirmado'
    }
  } catch (err) {
    console.error('Erro ao confirmar agendamento:', err)
    error.value = 'Erro ao confirmar agendamento'
  }
}

async function cancelarAgendamento(id) {
  try {
    const agendamentoRef = doc(db, 'agendamentos', id)
    await updateDoc(agendamentoRef, {
      status: 'cancelado'
    })

    // Atualiza o status localmente
    const index = agendamentos.value.findIndex(a => a.id === id)
    if (index !== -1) {
      agendamentos.value[index].status = 'cancelado'
    }
  } catch (err) {
    console.error('Erro ao cancelar agendamento:', err)
    error.value = 'Erro ao cancelar agendamento'
  }
}

function statusClass(status) {
  switch (status) {
    case 'confirmado': return 'text-green-600 font-bold'
    case 'pendente': return 'text-yellow-600 font-bold'
    case 'cancelado': return 'text-red-600 font-bold'
    default: return ''
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
      carregarAgendamentos()
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