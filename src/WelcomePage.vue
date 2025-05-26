<template>
  <div class="min-h-screen bg-gradient-to-b from-blue-600 to-white flex flex-col items-center justify-between">
    <!-- Logo & Slogan -->
    <div class="w-full text-center mt-10">
      <!-- <img src="/logo.svg" alt="Logo" class="mx-auto w-20 h-20 mb-4" /> -->
      <h1 class="text-3xl font-bold text-white drop-shadow-lg">Agenda Arroio do Sal</h1>
      <p class="text-blue-100 text-lg mt-2 mb-6">
        O jeito mais fácil de agendar serviços no litoral gaúcho!
      </p>
    </div>

    <!-- Destaques/Benefícios -->
    <div class="w-full max-w-md mx-auto bg-white/70 rounded-2xl shadow-lg p-6 flex flex-col gap-4">
      <h2 class="text-xl font-bold text-blue-700">Por que usar?</h2>
      <ul class="space-y-2 text-blue-900">
        <li>✔️ Agenda online simples e rápida</li>
        <li>✔️ Encontre e avalie profissionais locais</li>
        <li>✔️ Receba promoções exclusivas</li>
        <li>✔️ Agende pelo celular, onde estiver</li>
        <li>✔️ Gratuito para clientes</li>
      </ul>
    </div>

    <!-- Chamada para ação -->
    <div class="w-full max-w-md flex flex-col items-center gap-4 mt-10 mb-8">
      <router-link to="/login" class="w-full">
        <button class="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-2xl font-semibold text-lg shadow transition">
          Entrar / Criar Conta
        </button>
      </router-link>
      <router-link to="/home" class="w-full">
        <button class="w-full bg-white text-blue-700 border border-blue-700 py-3 rounded-2xl font-semibold text-lg shadow transition">
          Conhecer os Serviços
        </button>
      </router-link>
    </div>

    <!-- Rodapé -->
    <footer class="mb-3 text-xs text-blue-100 text-center opacity-80">
      Arroio do Sal, RS • Feito para a comunidade local<br/>
      <span class="italic">© {{ new Date().getFullYear() }} Agenda Arroio do Sal</span>
    </footer>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { auth } from './services/firebase'

const router = useRouter()

onMounted(() => {
  // Se o usuário já está logado, manda direto pra Home
  auth.onAuthStateChanged((user) => {
    if (user) {
      router.push({ name: 'Home' }) // ajuste o nome da rota conforme seu projeto
    }
  })
})
</script>
