<template>
  <div class="min-h-screen bg-gradient-to-b from-blue-100 to-white flex flex-col">
    <!-- Header -->
    <header class="bg-blue-700 text-white p-4 rounded-b-3xl shadow-lg mb-2">
      <h1 class="text-2xl font-bold">Agenda Arroio do Sal</h1>
      <p class="text-sm mt-1">Sua agenda local para serviços, profissionais e promoções!</p>
    </header>

    <!-- Ações rápidas -->
    <div class="flex flex-col gap-4 px-4 mt-4">
      <router-link to="/agendar" class="w-full">
        <button class="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-2xl font-semibold text-lg shadow transition">
          Agende um Serviço
        </button>
      </router-link>
      <router-link to="/profissional" class="w-full">
        <button class="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-2xl font-semibold text-lg shadow transition">
          Sou Profissional/Empresa
        </button>
      </router-link>
    </div>

    <!-- Promoções do dia -->
    <section class="px-4 mt-8">
      <h2 class="text-lg font-bold mb-2 text-blue-700">Promoções do dia</h2>
      <div v-if="loading" class="text-center py-4">
        <p class="text-gray-600">Carregando promoções...</p>
      </div>
      <div v-else-if="error" class="text-center py-4">
        <p class="text-red-600">{{ error }}</p>
      </div>
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div v-for="promo in promocoes" :key="promo.id" class="bg-white rounded-xl shadow p-3 flex flex-col gap-2">
          <h3 class="font-bold text-base text-blue-800">{{ promo.servico }}</h3>
          <p class="text-gray-700">{{ promo.descricao }}</p>
          <span class="bg-green-200 text-green-800 px-2 py-1 rounded text-xs font-bold self-start">
            {{ promo.desconto }}% OFF
          </span>
          <span class="text-gray-400 text-xs">Válido até {{ formatDate(promo.validade) }}</span>
        </div>
      </div>
    </section>

    <!-- Serviços mais buscados -->
    <section class="px-4 mt-8 mb-8">
      <h2 class="text-lg font-bold mb-2 text-blue-700">Serviços populares</h2>
      <div v-if="loading" class="text-center py-4">
        <p class="text-gray-600">Carregando serviços...</p>
      </div>
      <div v-else-if="error" class="text-center py-4">
        <p class="text-red-600">{{ error }}</p>
      </div>
      <div v-else class="flex gap-3 overflow-x-auto">
        <div
          v-for="servico in servicosPopulares"
          :key="servico.id"
          class="bg-white rounded-xl shadow p-4 min-w-[160px] flex flex-col items-center"
        >
          <span class="text-3xl mb-2">{{ servico.emoji }}</span>
          <h3 class="font-bold text-base text-blue-900">{{ servico.nome }}</h3>
          <p class="text-sm text-gray-700">{{ servico.descricao }}</p>
        </div>
      </div>
    </section>

    <!-- Rodapé -->
    <footer class="mt-auto bg-blue-100 text-blue-900 p-4 text-center text-xs rounded-t-3xl">
      <p>
        Arroio do Sal, RS • Feito com ☕ e código por você <br />
        <span class="italic">© {{ new Date().getFullYear() }} Agenda Arroio do Sal</span>
      </p>
    </footer>
  </div>
</template>

<script setup>
import { db } from '../services/firebase'
import { collection, getDocs, limit, orderBy, query, where } from 'firebase/firestore'
import { onMounted, ref } from 'vue'

const promocoes = ref([])
const servicosPopulares = ref([])
const loading = ref(true)
const error = ref('')

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('pt-BR')
}

const fetchPromocoes = async () => {
  try {
    const hoje = new Date()
    const q = query(
      collection(db, 'promocoes'),
      where('validade', '>=', hoje),
      orderBy('validade', 'asc'),
      limit(4)
    )
    const querySnapshot = await getDocs(q)
    promocoes.value = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (err) {
    console.error('Erro ao buscar promoções:', err)
    error.value = 'Erro ao carregar promoções'
  }
}

const fetchServicosPopulares = async () => {
  try {
    const q = query(
      collection(db, 'servicos'),
      orderBy('visualizacoes', 'desc'),
      limit(5)
    )
    const querySnapshot = await getDocs(q)
    servicosPopulares.value = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (err) {
    console.error('Erro ao buscar serviços:', err)
    error.value = 'Erro ao carregar serviços populares'
  }
}

onMounted(async () => {
  try {
    loading.value = true
    await Promise.all([fetchPromocoes(), fetchServicosPopulares()])
  } catch (err) {
    console.error('Erro ao carregar dados:', err)
    error.value = 'Erro ao carregar dados'
  } finally {
    loading.value = false
  }
})
</script>
