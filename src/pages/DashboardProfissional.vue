<template>
  <HeaderPadrao />
  <div class="min-h-screen bg-gradient-to-b from-blue-100 to-white pt-8 flex flex-col items-center">
    <div class="w-full max-w-3xl space-y-8">
      <!-- Dados da Empresa -->
      <div class="bg-white p-6 rounded-xl shadow flex items-center gap-6">
        <div>
          <h2 class="text-xl font-bold mb-1">Empresa: {{ empresa.nome }}</h2>
          <p class="text-gray-700">Descrição: {{ empresa.descricao }}</p>
          <p class="text-gray-700">Endereço: {{ empresa.endereco }}</p>
        </div>
      </div>

      <!-- Agendamentos Recebidos -->
      <div class="bg-white p-6 rounded-xl shadow">
        <h3 class="text-lg font-bold mb-4 text-blue-700">Agendamentos Recebidos</h3>
        <div v-if="agendamentos.length === 0" class="text-gray-500 text-center">Nenhum agendamento recebido.</div>
        <div v-else class="space-y-3">
          <div v-for="ag in agendamentos" :key="ag.id" class="border-b pb-2 last:border-b-0 last:pb-0 flex justify-between items-center">
            <div>
              <p class="font-semibold">{{ ag.servico }}</p>
              <p class="text-sm text-gray-600">Cliente: {{ ag.cliente }}</p>
              <p class="text-sm text-gray-600">Data: {{ formatDate(ag.data) }} - {{ ag.hora }}</p>
              <p class="text-xs text-gray-500">Status: <span :class="statusClass(ag.status)">{{ ag.status }}</span></p>
            </div>
            <button v-if="ag.status === 'pendente'" class="text-green-600 hover:underline text-xs" @click="confirmarAgendamento(ag.id)">Confirmar</button>
          </div>
        </div>
      </div>

      <!-- Gestão de Serviços -->
      <div class="bg-white p-6 rounded-xl shadow">
        <h3 class="text-lg font-bold mb-4 text-blue-700">Serviços Oferecidos</h3>
        <div v-if="servicos.length === 0" class="text-gray-500 text-center">Nenhum serviço cadastrado.</div>
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div v-for="servico in servicos" :key="servico.id" class="bg-blue-50 rounded-lg p-3 flex flex-col gap-1 border border-blue-100">
            <h4 class="font-bold text-blue-800">{{ servico.nome }}</h4>
            <p class="text-gray-700 text-sm">{{ servico.descricao }}</p>
            <span class="text-2xl">{{ servico.emoji }}</span>
          </div>
        </div>
        <div class="text-center mt-4">
          <button class="text-blue-700 hover:underline font-semibold" @click="adicionarServico">Adicionar novo serviço</button>
        </div>
      </div>

      <!-- Promoções da Empresa -->
      <div class="bg-white p-6 rounded-xl shadow">
        <h3 class="text-lg font-bold mb-4 text-blue-700">Promoções Ativas</h3>
        <div v-if="promocoes.length === 0" class="text-gray-500 text-center">Nenhuma promoção ativa.</div>
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div v-for="promo in promocoes" :key="promo.id" class="bg-green-50 rounded-lg p-3 flex flex-col gap-1 border border-green-100">
            <h4 class="font-bold text-green-800">{{ promo.titulo }}</h4>
            <p class="text-gray-700 text-sm">{{ promo.descricao }}</p>
            <span class="bg-green-200 text-green-800 px-2 py-1 rounded text-xs font-bold self-start">Válido até {{ formatDate(promo.validade) }}</span>
          </div>
        </div>
        <div class="text-center mt-4">
          <button class="text-green-700 hover:underline font-semibold" @click="adicionarPromocao">Adicionar promoção</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import HeaderPadrao from '../components/HeaderPadrao.vue'
import { formatDate } from '../utils'

// MOCK: Dados da empresa
const empresa = ref({
  nome: 'Salão Exemplo',
  descricao: 'Beleza e bem-estar para você!',
  endereco: 'Rua das Flores, 123, Centro'
})

// MOCK: Agendamentos recebidos
const agendamentos = ref([
  { id: 1, servico: 'Corte de Cabelo', cliente: 'Maria', data: '2025-06-01', hora: '14:00', status: 'pendente' },
  { id: 2, servico: 'Manicure', cliente: 'João', data: '2025-06-10', hora: '10:30', status: 'confirmado' }
])

// MOCK: Serviços oferecidos
const servicos = ref([
  { id: 1, nome: 'Corte de Cabelo', descricao: 'Corte masculino e feminino', emoji: '💇‍♂️' },
  { id: 2, nome: 'Manicure', descricao: 'Cuidado com as unhas', emoji: '💅' }
])

// MOCK: Promoções
const promocoes = ref([
  { id: 1, titulo: 'Promo Corte', descricao: 'Corte com 20% OFF', validade: '2025-06-15' },
  { id: 2, titulo: 'Promo Manicure', descricao: 'Manicure por R$ 20', validade: '2025-06-30' }
])

function statusClass(status) {
  switch (status) {
    case 'confirmado': return 'text-green-600 font-bold'
    case 'pendente': return 'text-yellow-600 font-bold'
    case 'cancelado': return 'text-red-600 font-bold'
    default: return ''
  }
}

function confirmarAgendamento(id) {
  alert('Funcionalidade de confirmação em breve!')
}

function adicionarServico() {
  alert('Funcionalidade de adicionar serviço em breve!')
}

function adicionarPromocao() {
  alert('Funcionalidade de adicionar promoção em breve!')
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