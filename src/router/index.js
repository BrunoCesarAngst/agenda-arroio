// router/index.js

import { createRouter, createWebHistory } from 'vue-router'
import { auth } from '../services/firebase'

// Importe suas páginas/components principais
import WelcomePage from '../WelcomePage.vue'
import CadastroPage from '../pages/CadastroComplementar.vue'
import Home from '../pages/Home.vue'
import LoginPage from '../pages/LoginPage.vue'
// Adicione outras páginas quando quiser

const devMode = import.meta.env.VITE_DEV_MODE === 'true'

const routes = [
  {
    path: '/',
    name: 'Welcome',
    component: WelcomePage,
    meta: { requiresAuth: false }
  },
  {
    path: '/home',
    name: 'Home',
    component: Home,
    meta: { requiresAuth: true }
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginPage,
    meta: { requiresAuth: false }
  },
  {
    path: '/Cadastro',
    name: 'Cadastro',
    component: CadastroPage,
    meta: { requiresAuth: false }
  },

  // Adicione outras rotas conforme for criando as telas!
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Navigation guard
router.beforeEach(async (to, from, next) => {
  // Modo desenvolvedor: ignora todas as proteções
  if (devMode) {
    console.log('🔧 Modo desenvolvedor ativo - Ignorando proteções de rota')
    next()
    return
  }

  // Regras normais para produção
  const requiresAuth = to.meta.requiresAuth
  const user = auth.currentUser

  if (requiresAuth && !user) {
    console.log('🔒 Rota protegida - Redirecionando para login')
    next('/login')
  } else {
    next()
  }
})

export default router
