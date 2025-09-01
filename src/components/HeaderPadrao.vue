<template>
  <header class="bg-blue-700 text-white p-4 rounded-b-3xl shadow-lg mb-2 flex items-center justify-between">
    <div>
      <h1 class="text-2xl font-bold">Agenda Arroio do Sal</h1>
      <p class="text-sm mt-1">Sua agenda local para serviços, profissionais e promoções!</p>
      <p v-if="userName" class="mt-2 text-base font-semibold">Fique à vontade, {{ userName }}!</p>
    </div>
    <button
      v-if="isLogged"
      @click="logout"
      class="ml-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition text-sm font-semibold"
    >
      Sair
    </button>
  </header>
</template>

<script setup>
import { signOut } from 'firebase/auth'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { auth } from '../services/firebase'

const router = useRouter()
const isLogged = ref(false)
const userName = ref('')

function logout() {
  signOut(auth)
  router.push('/login')
}

function updateUserInfo(user) {
  isLogged.value = !!user
  if (user) {
    userName.value = user.displayName || user.email || ''
  } else {
    userName.value = ''
  }
}

onMounted(() => {
  updateUserInfo(auth.currentUser)
  auth.onAuthStateChanged(updateUserInfo)
})
</script>

<style scoped>
header {
  min-width: 0;
}
</style>