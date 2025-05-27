<template>
  <div v-if="devMode" :class="['fixed bottom-4 right-4 z-50 transition-all', minimized ? 'w-16 h-16 p-0' : 'min-w-[340px] max-w-xs p-4 bg-gray-900 rounded-xl shadow-2xl text-white']">
    <button
      @click="minimized = !minimized"
      :aria-label="minimized ? 'Expandir DevTools' : 'Minimizar DevTools'"
      class="absolute top-2 right-2 bg-gray-700 hover:bg-gray-600 rounded-full p-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 z-10"
    >
      <span v-if="!minimized">—</span>
      <span v-else>🔧</span>
    </button>
    <template v-if="!minimized">
      <h3 class="font-bold mb-3 text-lg flex items-center gap-2">
        <span>🔧 Dev Tools</span>
      </h3>
      <div class="space-y-2">
        <div class="flex items-center gap-2 text-sm">
          <span class="font-semibold">Usuário:</span>
          <span class="truncate max-w-[120px]">{{ user?.email || 'Não logado' }}</span>
          <button v-if="user?.email" @click="copiar(user.email)" class="text-xs bg-gray-700 px-1 rounded hover:bg-gray-600">📋</button>
        </div>
        <div class="flex items-center gap-2 text-sm">
          <span class="font-semibold">UID:</span>
          <span class="truncate max-w-[120px]">{{ user?.uid || '-' }}</span>
          <button v-if="user?.uid" @click="copiar(user.uid)" class="text-xs bg-gray-700 px-1 rounded hover:bg-gray-600">📋</button>
        </div>
        <div class="flex items-center gap-2 text-sm">
          <span class="font-semibold">Tipo:</span>
          <span>{{ user?.tipo || '-' }}</span>
        </div>
        <div class="flex items-center gap-2 text-sm">
          <span class="font-semibold">Autenticado:</span>
          <span :class="user ? 'text-green-400' : 'text-red-400'">{{ user ? 'Sim' : 'Não' }}</span>
        </div>
        <div class="flex items-center gap-2 text-sm">
          <span class="font-semibold">Claims:</span>
          <span class="truncate max-w-[120px]">{{ claims ? JSON.stringify(claims) : '-' }}</span>
        </div>
        <div class="flex items-center gap-2 text-sm">
          <span class="font-semibold">AppCheck:</span>
          <span :class="appCheckToken ? 'text-green-400' : 'text-red-400'">{{ appCheckToken ? 'Ativo' : 'Inativo' }}</span>
        </div>
        <div class="flex gap-2 mt-3">
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
          <button
            v-if="user"
            @click="logout"
            class="px-2 py-1 bg-red-600 rounded text-xs hover:bg-red-700"
          >
            Sair
          </button>
        </div>
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
    </template>
  </div>
</template>

<script setup>
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { doc, getDoc, getFirestore } from 'firebase/firestore'
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { auth } from '../services/firebase'

const router = useRouter()
const route = useRoute()
const devMode = ref(import.meta.env.VITE_DEV_MODE === 'true')
const user = ref(null)
const claims = ref(null)
const appCheckToken = ref(null)
const db = getFirestore()
const paginaSelecionada = ref('')
const minimized = ref(false)

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

onMounted(() => {
  if (devMode.value) {
    onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Busca dados do Firestore
        const userDoc = await getDoc(doc(db, 'usuarios', firebaseUser.uid))
        user.value = userDoc.exists() ? { ...userDoc.data(), email: firebaseUser.email, uid: firebaseUser.uid } : { email: firebaseUser.email, uid: firebaseUser.uid, tipo: '-' }
        // Claims customizadas
        claims.value = (await firebaseUser.getIdTokenResult()).claims
      } else {
        user.value = null
        claims.value = null
      }
    })
    // AppCheck status (se disponível)
    if (window.firebase && window.firebase.appCheck) {
      window.firebase.appCheck().getToken().then(token => {
        appCheckToken.value = token.token
      }).catch(() => {
        appCheckToken.value = null
      })
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

async function logout() {
  await signOut(auth)
  user.value = null
  router.push('/login')
}

function copiar(valor) {
  navigator.clipboard.writeText(valor)
}
</script>