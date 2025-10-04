<template>
  <form @submit.prevent="handleLogin" class="space-y-4">
    <div>
      <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
      <input
        type="email"
        id="email"
        v-model="email"
        required
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
      />
    </div>
    <div>
      <label for="password" class="block text-sm font-medium text-gray-700">Senha</label>
      <input
        type="password"
        id="password"
        v-model="password"
        required
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
      />
    </div>
    <button
      type="submit"
      :disabled="loading"
      class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
    >
      {{ loading ? 'Entrando...' : 'Entrar' }}
    </button>
    <p v-if="error" class="text-red-500 text-sm text-center">{{ error }}</p>
  </form>
</template>

<script setup>
import { signInWithEmailAndPassword } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { auth } from '../../services/firebase'
import { useUserStore } from '../../stores/user'

const router = useRouter()
const userStore = useUserStore()
const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')
const db = getFirestore()

const handleLogin = async () => {
  try {
    loading.value = true
    error.value = ''

    // Tenta fazer login
    const userCredential = await signInWithEmailAndPassword(auth, email.value, password.value)

    // Aguarda a store atualizar os dados do usuário
    await userStore.refreshUserData()

    // Verifica se precisa completar o cadastro
    if (!userStore.hasCompletedProfile) {
      router.push('/cadastro')
    } else {
      router.push('/')
    }
  } catch (err) {
    console.error('Erro no login:', err)

    // Mensagens de erro amigáveis sem revelar detalhes sensíveis
    switch (err.code) {
      case 'auth/user-not-found':
      case 'auth/wrong-password':
        error.value = 'Email ou senha incorretos'
        break
      case 'auth/too-many-requests':
        error.value = 'Muitas tentativas. Tente novamente mais tarde'
        break
      case 'auth/invalid-email':
        error.value = 'Email inválido'
        break
      case 'auth/user-disabled':
        error.value = 'Esta conta foi desativada'
        break
      default:
        error.value = 'Erro ao fazer login. Tente novamente'
    }
  } finally {
    loading.value = false
  }
}
</script>
