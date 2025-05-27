<template>
  <HeaderPadrao />
  <div class="min-h-screen bg-gradient-to-b from-blue-100 to-white pt-8 flex flex-col items-center">
    <div class="w-full max-w-2xl space-y-8">
      <!-- Resumo do usuário -->
      <div class="bg-white p-6 rounded-xl shadow flex items-center gap-6">
        <img v-if="userData && userData.foto" :src="userData.foto" alt="Foto do usuário" class="w-20 h-20 rounded-full border-2 border-blue-400" />
        <div>
          <h2 class="text-xl font-bold mb-1">Olá, {{ userData?.nome }}!</h2>
          <p class="text-gray-700">{{ userData?.email }}</p>
          <p class="text-gray-700">Telefone: {{ userData?.telefone }}</p>
        </div>
      </div>

      <!-- Ações rápidas -->
      <div class="flex gap-4 justify-center">
        <button @click="agendarServico" class="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded font-bold shadow">Agendar novo serviço</button>
        <button @click="abrirModalEditar" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-bold shadow">Editar perfil</button>
      </div>

      <!-- Meus Agendamentos -->
      <div class="bg-white p-6 rounded-xl shadow">
        <h3 class="text-lg font-bold mb-4 text-blue-700">Meus Agendamentos</h3>
        <div v-if="agendamentos.length === 0" class="text-gray-500 text-center">Nenhum agendamento encontrado.</div>
        <div v-else class="space-y-3">
          <div v-for="ag in agendamentos" :key="ag.id" class="border-b pb-2 last:border-b-0 last:pb-0 flex justify-between items-center">
            <div>
              <p class="font-semibold">{{ ag.servico }}</p>
              <p class="text-sm text-gray-600">Data: {{ formatDate(ag.data) }} - {{ ag.hora }}</p>
              <p class="text-xs text-gray-500">Status: <span :class="statusClass(ag.status)">{{ ag.status }}</span></p>
            </div>
            <button v-if="ag.status === 'pendente'" class="text-red-600 hover:underline text-xs" @click="cancelarAgendamento(ag.id)">Cancelar</button>
          </div>
        </div>
      </div>

      <!-- Promoções em destaque -->
      <div class="bg-white p-6 rounded-xl shadow">
        <h3 class="text-lg font-bold mb-4 text-blue-700">Promoções em destaque</h3>
        <div v-if="promocoes.length === 0" class="text-gray-500 text-center">Nenhuma promoção ativa.</div>
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div v-for="promo in promocoes" :key="promo.id" class="bg-blue-50 rounded-lg p-3 flex flex-col gap-1 border border-blue-100">
            <h4 class="font-bold text-blue-800">{{ promo.servico }}</h4>
            <p class="text-gray-700 text-sm">{{ promo.descricao }}</p>
            <span class="bg-green-200 text-green-800 px-2 py-1 rounded text-xs font-bold self-start">{{ promo.desconto }}% OFF</span>
            <span class="text-gray-400 text-xs">Válido até {{ formatDate(promo.validade) }}</span>
          </div>
        </div>
        <div class="text-center mt-4">
          <button class="text-blue-700 hover:underline font-semibold" @click="verTodasPromocoes">Ver todas promoções</button>
        </div>
      </div>
    </div>

    <!-- Modal de edição de perfil -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div class="bg-white rounded-xl shadow-lg p-8 w-full max-w-sm relative">
        <button @click="fecharModal" class="absolute top-2 right-2 text-gray-500 hover:text-red-600 text-xl">&times;</button>
        <h3 class="text-xl font-bold mb-4 text-center">Editar Perfil</h3>
        <form @submit.prevent="salvarEdicao">
          <div class="mb-4">
            <label class="block text-gray-700 mb-1">Telefone</label>
            <input v-model="telefoneEdit" type="tel" class="w-full border rounded px-3 py-2" placeholder="Digite seu telefone" required />
          </div>
          <button type="submit" class="w-full bg-blue-600 text-white py-2 rounded font-bold hover:bg-blue-700 transition">Salvar</button>
          <p v-if="erroEdicao" class="text-red-600 text-center mt-2">{{ erroEdicao }}</p>
          <p v-if="sucessoEdicao" class="text-green-600 text-center mt-2">Telefone atualizado com sucesso!</p>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { doc, getFirestore, updateDoc } from 'firebase/firestore'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import HeaderPadrao from '../components/HeaderPadrao.vue'
import useAuthUser from '../useAuthUser'
import { formatDate } from '../utils'

const router = useRouter()
const { user, userData, loading } = useAuthUser()
const db = getFirestore()

// Modal de edição de perfil
const showModal = ref(false)
const telefoneEdit = ref('')
const erroEdicao = ref('')
const sucessoEdicao = ref(false)

function abrirModalEditar() {
  erroEdicao.value = ''
  sucessoEdicao.value = false
  telefoneEdit.value = userData.value?.telefone || ''
  showModal.value = true
}
function fecharModal() {
  showModal.value = false
}

async function salvarEdicao() {
  erroEdicao.value = ''
  sucessoEdicao.value = false
  if (!user.value) {
    erroEdicao.value = 'Usuário não autenticado.'
    return
  }
  try {
    await updateDoc(doc(db, 'usuarios', user.value.uid), { telefone: telefoneEdit.value })
    sucessoEdicao.value = true
    // Atualiza o valor local também
    if (userData.value) userData.value.telefone = telefoneEdit.value
    setTimeout(() => fecharModal(), 1200)
  } catch (e) {
    erroEdicao.value = 'Erro ao atualizar telefone.'
  }
}

// MOCK: Agendamentos do usuário
const agendamentos = ref([
  { id: 1, servico: 'Corte de Cabelo', data: '2025-06-01', hora: '14:00', status: 'confirmado' },
  { id: 2, servico: 'Manicure', data: '2025-06-10', hora: '10:30', status: 'pendente' },
  { id: 3, servico: 'Massagem', data: '2025-05-20', hora: '16:00', status: 'cancelado' }
])

// MOCK: Promoções em destaque
const promocoes = ref([
  { id: 1, servico: 'Corte de Cabelo', descricao: 'Desconto especial para novos clientes!', desconto: 20, validade: '2025-06-15' },
  { id: 2, servico: 'Massagem Relaxante', descricao: 'Promoção de inverno!', desconto: 15, validade: '2025-06-30' }
])

function statusClass(status) {
  switch (status) {
    case 'confirmado': return 'text-green-600 font-bold'
    case 'pendente': return 'text-yellow-600 font-bold'
    case 'cancelado': return 'text-red-600 font-bold'
    default: return ''
  }
}

function agendarServico() {
  router.push('/') // ou para a página de agendamento específica
}

function cancelarAgendamento(id) {
  alert('Funcionalidade de cancelamento em breve!')
}

function verTodasPromocoes() {
  router.push('/') // ou para a página de promoções
}
</script>

<style scoped>
.bg-gradient-to-b {
  min-height: 100vh;
}
.pt-8 {
  padding-top: 2rem;
}
</style>