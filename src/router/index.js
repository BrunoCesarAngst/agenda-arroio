// router/index.js

import { getAuth } from 'firebase/auth'
import { createRouter, createWebHistory } from 'vue-router'

// Importe suas páginas/components principais
import WelcomePage from '../WelcomePage.vue'
import Home from '../pages/Home.vue'
import LoginPage from '../pages/LoginPage.vue'
// Adicione outras páginas quando quiser

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
  // Adicione outras rotas conforme for criando as telas!
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Navigation guard
router.beforeEach((to, from, next) => {
  const auth = getAuth()
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)

  if (requiresAuth && !auth.currentUser) {
    next('/login')
  } else {
    next()
  }
})

export default router
