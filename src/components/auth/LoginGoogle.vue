<template>
  <button
    @click="handleGoogleLogin"
    :disabled="loading"
    class="w-full flex items-center justify-center gap-2 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
  >
    <img src="https://www.google.com/favicon.ico" alt="Google" class="w-5 h-5" />
    {{ loading ? 'Entrando...' : 'Entrar com Google' }}
  </button>
  <p v-if="error" class="text-red-500 text-sm text-center mt-2">{{ error }}</p>
</template>

<script setup>
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { auth } from '../../services/firebase'
import { useUserStore } from '../../stores/user'

const router = useRouter()
const userStore = useUserStore()
const loading = ref(false)
const error = ref('')
const db = getFirestore()

const handleGoogleLogin = async () => {
  try {
    loading.value = true
    error.value = ''

    // Tenta fazer login com Google
    const provider = new GoogleAuthProvider()
    const userCredential = await signInWithPopup(auth, provider)

    // Aguarda a store atualizar os dados do usuário
    await userStore.refreshUserData()

    // Verifica se precisa completar o cadastro
    if (!userStore.hasCompletedProfile) {
      router.push('/cadastro')
    } else {
      router.push('/')
    }
  } catch (err) {
    console.error('Erro no login com Google:', err)

    // Mensagens de erro amigáveis
    if (err.code === 'auth/popup-closed-by-user') {
      error.value = 'Login cancelado'
    } else if (err.code === 'auth/popup-blocked') {
      error.value = 'Popup bloqueado pelo navegador. Por favor, permita popups para este site'
    } else {
      error.value = 'Erro ao fazer login com Google. Tente novamente'
    }
  } finally {
    loading.value = false
  }
}
</script>
