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
      <router-link to="/admin-login" class="w-full">
        <button class="w-full bg-white text-blue-700 border border-blue-700 py-3 rounded-2xl font-semibold text-lg shadow transition">
          Área Administrativa
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

<style scoped>
.welcome-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.welcome-content {
  text-align: center;
  padding: 2rem;
  background: white;
  border-radius: 1rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  width: 90%;
}

h1 {
  color: #2c3e50;
  margin-bottom: 1rem;
}

p {
  color: #666;
  margin-bottom: 2rem;
}

.auth-buttons {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s ease;
}

.btn-primary {
  background-color: #4CAF50;
  color: white;
}

.btn-primary:hover {
  background-color: #45a049;
}

.btn-secondary {
  background-color: #2196F3;
  color: white;
}

.btn-secondary:hover {
  background-color: #1976D2;
}

.btn-link {
  color: #666;
  text-decoration: underline;
}

.btn-link:hover {
  color: #333;
}
</style>
