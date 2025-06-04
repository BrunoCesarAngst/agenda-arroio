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
      <section class="bg-gray-800 rounded p-2 mb-3 text-xs">
        <div class="mb-1">
          <span class="font-semibold">Ambiente:</span>
          <span :class="isEmulator ? 'text-yellow-400' : 'text-green-400'">{{ isEmulator ? 'Emulador' : 'Firebase Prod' }}</span>
        </div>
        <div class="mb-1">
          <span class="font-semibold">Origem dos dados:</span>
          <span>{{ userSource }}</span>
        </div>
        <div class="mb-1">
          <span class="font-semibold">Rota atual:</span>
          <span>{{ route.fullPath }}</span>
        </div>
      </section>
      <section class="bg-gray-800 rounded p-2 mb-3 text-xs">
        <div class="mb-1">
          <span class="font-semibold">Coleção/ID usuário:</span>
          <span v-if="userDocPath">{{ userDocPath }}</span>
          <span v-else>-</span>
          <button v-if="userDocPath && userDocPath !== '-'" @click="copiar(userDocPath)" class="ml-2 text-xs bg-gray-700 px-1 rounded hover:bg-gray-600">📋</button>
        </div>
        <div class="mb-1">
          <span class="font-semibold">E-mail:</span>
          <span>{{ user?.email || '-' }}</span>
          <button v-if="user?.email" @click="copiar(user.email)" class="ml-2 text-xs bg-gray-700 px-1 rounded hover:bg-gray-600">📋</button>
        </div>
        <div class="mb-1">
          <span class="font-semibold">UID:</span>
          <span>{{ user?.uid || '-' }}</span>
          <button v-if="user?.uid" @click="copiar(user.uid)" class="ml-2 text-xs bg-gray-700 px-1 rounded hover:bg-gray-600">📋</button>
        </div>
        <div class="mb-1">
          <span class="font-semibold">Tipo de usuário:</span>
          <span>{{ userType }}</span>
        </div>
        <div class="mb-1">
          <span class="font-semibold">Autenticado:</span>
          <span :class="user ? 'text-green-400' : 'text-red-400'">{{ user ? 'Sim' : 'Não' }}</span>
        </div>
      </section>
      <section v-if="empresaInfo" class="bg-gray-800 rounded p-2 mb-3 text-xs">
        <div>
          <span class="font-semibold">Empresa vinculada:</span>
          <span>{{ empresaInfo }}</span>
          <button @click="copiar(empresaInfo)" class="ml-2 text-xs bg-gray-700 px-1 rounded hover:bg-gray-600">📋</button>
        </div>
      </section>
      <section class="bg-gray-800 rounded p-2 mb-3 text-xs">
        <div class="mb-1 flex items-center">
          <span class="font-semibold">Claims:</span>
          <span class="truncate max-w-[120px] ml-1">{{ claimsResumo }}</span>
          <button v-if="claims" @click="mostrarClaims = true" class="ml-2 text-xs bg-gray-700 px-1 rounded hover:bg-gray-600">Ver completo</button>
        </div>
        <div class="mb-1">
          <span class="font-semibold">AppCheck:</span>
          <span :class="appCheckToken ? 'text-green-400' : 'text-red-400'">{{ appCheckToken ? 'Ativo' : 'Inativo' }}</span>
        </div>
      </section>
      <section class="flex gap-2 mb-3">
        <button
          v-if="user"
          @click="logout"
          class="px-2 py-1 bg-red-600 rounded text-xs hover:bg-red-700"
        >Sair</button>
      </section>
      <section class="mt-2 pt-2 border-t border-gray-700">
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
      </section>
    </template>
    <div v-if="mostrarClaims" class="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div class="bg-gray-900 rounded-xl shadow-2xl p-6 max-w-lg w-full relative">
        <button @click="mostrarClaims = false" class="absolute top-2 right-2 text-white text-2xl hover:text-blue-400" aria-label="Fechar claims">×</button>
        <h4 class="font-bold text-lg mb-4">Claims completos</h4>
        <pre class="bg-gray-800 rounded p-3 text-xs overflow-x-auto max-h-96 text-green-200">{{ claimsJson }}</pre>
        <button @click="copiar(claimsJson)" class="mt-2 px-3 py-1 bg-blue-600 rounded text-xs hover:bg-blue-700">Copiar JSON</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { getToken } from 'firebase/app-check'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { doc, getDoc, getFirestore } from 'firebase/firestore'
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { appCheck, auth } from '../services/firebase'

const router = useRouter()
const route = useRoute()
const devMode = ref(import.meta.env.VITE_DEV_MODE === 'true')
const user = ref(null)
const claims = ref(null)
const appCheckToken = ref(null)
const db = getFirestore()
const paginaSelecionada = ref('')
const minimized = ref(false)
const mostrarClaims = ref(false)

const userDocPath = ref('')
const userType = ref('-')
const userSource = ref('-')
const empresaInfo = ref('')
const isEmulator = ref(false)

const rotasOrdenadas = computed(() => {
  return router.getRoutes()
    .filter(rota => rota.name && !rota.name.includes('*'))
    .sort((a, b) => {
      const nameCompare = (a.name || '').localeCompare(b.name || '')
      return nameCompare !== 0 ? nameCompare : (a.path || '').localeCompare(b.path || '')
    })
})

const claimsResumo = computed(() => {
  if (!claims.value) return '-'
  const str = JSON.stringify(claims.value)
  return str.length > 40 ? str.slice(0, 40) + '...' : str
})
const claimsJson = computed(() => {
  if (!claims.value) return '-'
  return JSON.stringify(claims.value, null, 2)
})

console.log('DevTools - Modo dev:', devMode.value)

onMounted(() => {
  if (devMode.value) {
    onAuthStateChanged(auth, async (firebaseUser) => {
      let firestoreUser = null
      let firestoreSource = false
      let authSource = false
      if (firebaseUser) {
        let docRef = doc(db, 'usuarios', firebaseUser.uid)
        let userSnap = await getDoc(docRef)
        if (userSnap.exists()) {
          firestoreUser = userSnap.data()
          userDocPath.value = `usuarios/${firebaseUser.uid}`
          userType.value = firestoreUser.tipo || '-'
          firestoreSource = true
        } else {
          docRef = doc(db, 'clientes_externos', firebaseUser.uid)
          userSnap = await getDoc(docRef)
          if (userSnap.exists()) {
            firestoreUser = userSnap.data()
            userDocPath.value = `clientes_externos/${firebaseUser.uid}`
            userType.value = firestoreUser.tipo || 'externo'
            firestoreSource = true
          } else {
            userDocPath.value = '-'
            userType.value = '-'
          }
        }
        claims.value = (await firebaseUser.getIdTokenResult()).claims
        if (firebaseUser.email || firebaseUser.uid) authSource = true
        if (firestoreUser && firestoreUser.empresaId) {
          empresaInfo.value = `empresas/${firestoreUser.empresaId}`
        } else {
          empresaInfo.value = ''
        }
        if (firestoreSource && authSource) userSource.value = 'Firestore + Auth'
        else if (firestoreSource) userSource.value = 'Firestore'
        else if (authSource) userSource.value = 'Auth'
        else userSource.value = '-'
        user.value = firestoreUser ? { ...firestoreUser, email: firebaseUser.email, uid: firebaseUser.uid } : { email: firebaseUser.email, uid: firebaseUser.uid, tipo: '-' }
      } else {
        user.value = null
        claims.value = null
        userDocPath.value = ''
        userType.value = '-'
        userSource.value = '-'
        empresaInfo.value = ''
      }
    })
    getToken(appCheck, false)
      .then(tokenResult => {
        appCheckToken.value = tokenResult.token
      })
      .catch(() => {
        appCheckToken.value = null
      })
    isEmulator.value = Boolean(import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true' || (window && window.location && window.location.port && window.location.port.startsWith('8')))
  }
})

function navegarPara() {
  if (paginaSelecionada.value) {
    router.push(paginaSelecionada.value)
    paginaSelecionada.value = ''
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

<style scoped>
.bg-gray-800 {
  background: #1f2937;
}
</style>