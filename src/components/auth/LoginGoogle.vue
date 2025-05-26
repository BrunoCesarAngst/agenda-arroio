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
import { auth } from '../../services/firebase'
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const loading = ref(false)
const error = ref('')

const handleGoogleLogin = async () => {
  try {
    loading.value = true
    error.value = ''
    const provider = new GoogleAuthProvider()
    await signInWithPopup(auth, provider)
    router.push('/home')
  } catch (err) {
    error.value = 'Erro ao fazer login com Google'
    console.error('Erro no login com Google:', err)
  } finally {
    loading.value = false
  }
}
</script>
