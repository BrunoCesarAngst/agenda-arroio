<template>
  <div v-if="devMode" class="fixed bottom-4 right-4 bg-gray-800 text-white p-4 rounded-lg shadow-lg z-50">
    <h3 class="font-bold mb-2">🔧 Dev Tools</h3>
    <div class="space-y-2">
      <div class="text-sm">
        <span class="font-semibold">Usuário:</span>
        {{ user?.email || 'Não logado' }}
      </div>
      <div class="text-sm">
        <span class="font-semibold">Tipo:</span>
        {{ user?.tipo || '-' }}
      </div>
      <div class="flex gap-2">
        <button
          @click="simularLogin('cliente')"
          class="px-2 py-1 bg-blue-600 rounded text-xs hover:bg-blue-700"
        >
          Simular Cliente
        </button>
        <button
          @click="simularLogin('profissional')"
          class="px-2 py-1 bg-green-600 rounded text-xs hover:bg-green-700"
        >
          Simular Profissional
        </button>
      </div>

      <!-- Seletor de Páginas -->
      <div class="mt-4 pt-4 border-t border-gray-700">
        <h4 class="text-xs font-semibold mb-2">Navegação Rápida</h4>
        <select
          v-model="paginaSelecionada"
          @change="navegarPara"
          class="w-full bg-gray-700 text-white text-xs rounded p-1"
        >
          <option value="">Selecione uma página</option>
          <option
            v-for="rota in rotasOrdenadas"
            :key="rota.path"
            :value="rota.path"
          >
            {{ rota.name || rota.path }}
          </option>
        </select>
      </div>
    </div>
  </div>
</template>

<script setup>
import { doc, getDoc, getFirestore } from 'firebase/firestore'
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { auth } from '../services/firebase'

const router = useRouter()
const route = useRoute()
const devMode = ref(import.meta.env.VITE_DEV_MODE === 'true')
const user = ref(null)
const db = getFirestore()
const paginaSelecionada = ref('')

// Obtém todas as rotas do router e ordena por nome
const rotasOrdenadas = computed(() => {
  return router.getRoutes()
    .filter(rota => rota.name && !rota.name.includes('*')) // Remove rotas catch-all
    .sort((a, b) => {
      // Ordena primeiro por nome, depois por path
      const nameCompare = (a.name || '').localeCompare(b.name || '')
      return nameCompare !== 0 ? nameCompare : (a.path || '').localeCompare(b.path || '')
    })
})

console.log('DevTools - Modo dev:', devMode.value)

onMounted(async () => {
  console.log('DevTools - Componente montado')
  if (devMode.value && auth.currentUser) {
    const userDoc = await getDoc(doc(db, 'usuarios', auth.currentUser.uid))
    if (userDoc.exists()) {
      user.value = userDoc.data()
    }
  }
})

async function simularLogin(tipo) {
  console.log(`Simulando login como ${tipo}`)
  // Aqui você pode implementar a lógica para simular diferentes tipos de usuário
}

function navegarPara() {
  if (paginaSelecionada.value) {
    router.push(paginaSelecionada.value)
    paginaSelecionada.value = '' // Reset após navegação
  }
}
</script>