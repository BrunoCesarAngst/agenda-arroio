<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="bg-white p-6 rounded-lg shadow-xl w-full max-w-md space-y-6">
      <h2 class="text-2xl font-bold text-center mb-4">Acesse sua Conta</h2>
      <LoginEmail />
      <div class="text-center mt-2">
        <router-link to="/register" class="text-blue-600 hover:underline">Não tem conta? Cadastre-se</router-link>
      </div>
      <div class="my-2 flex items-center">
        <div class="flex-grow border-t"></div>
        <span class="mx-2 text-gray-500">ou</span>
        <div class="flex-grow border-t"></div>
      </div>
      <LoginGoogle />
    </div>
  </div>
</template>

<script setup>
import LoginEmail from '../components/auth/LoginEmail.vue';
import LoginGoogle from '../components/auth/LoginGoogle.vue';
</script>
