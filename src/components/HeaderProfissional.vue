<template>
  <header
    class="bg-gradient-to-r from-blue-800 to-blue-600 dark:from-gray-900 dark:to-gray-800 text-white p-3 rounded-b-3xl shadow-xl mb-4 transition-all duration-300"
    :class="{ 'opacity-90': !isOnline }"
  >
    <div class="max-w-7xl mx-auto flex items-center justify-between">
      <!-- Logo e Nome da Empresa -->
      <div class="flex items-center space-x-3">
        <div class="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm hover:scale-105 transition-transform duration-200">
          <span class="text-xl">🏢</span>
        </div>
        <div class="hidden sm:block">
          <h1 class="text-lg font-bold tracking-tight truncate max-w-[200px]">{{ empresa?.nome || 'Carregando...' }}</h1>
        </div>
      </div>

      <!-- Navegação Desktop -->
      <nav class="hidden md:flex items-center space-x-2">
        <router-link
          v-for="item in menuItems"
          :key="item.path"
          :to="item.path"
          class="px-3 py-1.5 rounded-lg transition-all duration-200 flex items-center space-x-1"
          :class="[$route.path === item.path ? 'bg-white/20 text-white' : 'text-blue-100 hover:bg-white/10']"
        >
          <span>{{ item.icon }}</span>
          <span class="text-sm">{{ item.label }}</span>
        </router-link>
      </nav>

      <!-- Ações -->
      <div class="flex items-center space-x-2">
        <!-- Status Online -->
        <div class="hidden sm:flex items-center space-x-1 px-2 py-1 bg-white/10 rounded-lg">
          <span class="w-2 h-2 rounded-full" :class="isOnline ? 'bg-green-500' : 'bg-red-500'"></span>
          <span class="text-xs">{{ isOnline ? 'Online' : 'Offline' }}</span>
        </div>

        <!-- Busca -->
        <div class="hidden lg:block">
          <div class="relative">
            <input
              type="text"
              v-model="searchQuery"
              placeholder="Buscar..."
              class="w-40 px-3 py-1 bg-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/20 text-sm"
            />
            <span class="absolute right-2 top-1.5 text-sm">🔍</span>
          </div>
        </div>

        <!-- Notificações -->
        <button
          @click="toggleNotifications"
          class="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-all duration-200 relative"
        >
          <span>🔔</span>
          <span
            v-if="unreadNotifications"
            class="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs flex items-center justify-center"
          >
            {{ unreadNotifications }}
          </span>
        </button>

        <!-- Tema -->
        <button
          @click="toggleTheme"
          class="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-all duration-200"
        >
          <span v-if="isDarkMode">🌞</span>
          <span v-else>🌙</span>
        </button>

        <!-- Sair -->
        <button
          @click="logout"
          class="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg backdrop-blur-sm transition-all duration-200 flex items-center space-x-1"
        >
          <span class="text-sm">Sair</span>
          <span>🚪</span>
        </button>

        <!-- Menu Mobile -->
        <button
          @click="toggleMobileMenu"
          class="md:hidden p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-all duration-200"
        >
          <span>{{ isMobileMenuOpen ? '✕' : '☰' }}</span>
        </button>
      </div>
    </div>

    <!-- Menu Mobile Dropdown -->
    <div
      v-show="isMobileMenuOpen"
      class="md:hidden mt-2 space-y-1"
    >
      <router-link
        v-for="item in menuItems"
        :key="item.path"
        :to="item.path"
        class="block px-3 py-2 rounded-lg transition-all duration-200"
        :class="[$route.path === item.path ? 'bg-white/20 text-white' : 'text-blue-100 hover:bg-white/10']"
        @click="isMobileMenuOpen = false"
      >
        <span class="flex items-center space-x-2">
          <span>{{ item.icon }}</span>
          <span>{{ item.label }}</span>
        </span>
      </router-link>
    </div>
  </header>
</template>

<script setup>
import { signOut } from 'firebase/auth'
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { auth } from '../services/firebase'

const route = useRoute()
const router = useRouter()

// Props
const props = defineProps({
  empresa: {
    type: Object,
    default: () => ({})
  }
})

// Emits
const emit = defineEmits(['search', 'notifications'])

// Estado local
const isDarkMode = ref(false)
const isOnline = ref(true)
const isMobileMenuOpen = ref(false)
const searchQuery = ref('')
const unreadNotifications = ref(3)

// Menu items
const menuItems = [
  { path: '/dashboard-empresa', label: 'Dashboard', icon: '📊' },
  { path: '/agendamentos', label: 'Agendamentos', icon: '📅' },
  { path: '/servicos', label: 'Serviços', icon: '💇' },
  { path: '/promocoes', label: 'Promoções', icon: '🎁' },
  { path: '/perfil', label: 'Perfil', icon: '👤' }
]

// Métodos
const toggleTheme = () => {
  isDarkMode.value = !isDarkMode.value
  document.documentElement.classList.toggle('dark')
}

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

const toggleNotifications = () => {
  emit('notifications')
  unreadNotifications.value = 0
}

const logout = async () => {
  try {
    await signOut(auth)
    router.push('/login')
  } catch (error) {
    console.error('Erro ao fazer logout:', error)
  }
}

// Watch para busca
watch(searchQuery, (newValue) => {
  emit('search', newValue)
})

// Monitorar status online/offline
const updateOnlineStatus = () => {
  isOnline.value = navigator.onLine
}

onMounted(() => {
  window.addEventListener('online', updateOnlineStatus)
  window.addEventListener('offline', updateOnlineStatus)
  updateOnlineStatus()
})

onUnmounted(() => {
  window.removeEventListener('online', updateOnlineStatus)
  window.removeEventListener('offline', updateOnlineStatus)
})
</script>

<style scoped>
.router-link-active {
  @apply bg-white/20 text-white;
}

/* Animações */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.fade-enter-active {
  animation: fadeIn 0.3s ease-in;
}

.fade-leave-active {
  animation: fadeIn 0.3s ease-in reverse;
}
</style>