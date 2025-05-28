// router/index.js

import { doc, getDoc, getFirestore } from 'firebase/firestore'
import { createRouter, createWebHistory } from 'vue-router'
import { auth } from '../services/firebase'

// Importe suas páginas/components principais
import WelcomePage from '../WelcomePage.vue'
import CadastroPage from '../pages/CadastroComplementar.vue'
import DashboardPage from '../pages/Dashboard.vue'
import DashboardProfissional from '../pages/DashboardProfissional.vue'
import Home from '../pages/Home.vue'
import LoginPage from '../pages/LoginPage.vue'
import RegisterPage from '../pages/RegisterPage.vue'
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
    path: '/cadastro',
    name: 'Cadastro',
    component: CadastroPage,
    meta: { requiresAuth: false }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: DashboardPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: RegisterPage,
    meta: { requiresAuth: false }
  },
  {
    path: '/dashboard-empresa',
    name: 'DashboardProfissional',
    component: DashboardProfissional,
    meta: { requiresAuth: true, onlyProfissional: true }
  },
  {
    path: '/agendamentos',
    name: 'Agendamentos',
    component: () => import('../pages/profissional/Agendamentos.vue'),
    meta: { requiresAuth: true, onlyProfissional: true }
  },
  {
    path: '/servicos',
    name: 'Servicos',
    component: () => import('../pages/profissional/Servicos.vue'),
    meta: { requiresAuth: true, onlyProfissional: true }
  },
  {
    path: '/promocoes',
    name: 'Promocoes',
    component: () => import('../pages/profissional/Promocoes.vue'),
    meta: { requiresAuth: true, onlyProfissional: true }
  },
  {
    path: '/perfil',
    name: 'PerfilEmpresa',
    component: () => import('../pages/profissional/Perfil.vue'),
    meta: { requiresAuth: true, onlyProfissional: true }
  }
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
    next()
    return
  }

  const requiresAuth = to.meta.requiresAuth
  const onlyCliente = to.meta.onlyCliente
  const onlyProfissional = to.meta.onlyProfissional
  const user = auth.currentUser

  if (requiresAuth && !user) {
    next('/login')
    return
  }

  if (user) {
    const db = getFirestore()
    const userDoc = await getDoc(doc(db, 'usuarios', user.uid))
    const userData = userDoc.exists() ? userDoc.data() : null

    // Se não tem tipo definido, força cadastro complementar
    if (!userData || !userData.tipo) {
      if (to.path !== '/cadastro') {
        next('/cadastro')
        return
      }
    }

    // Proteção por tipo de usuário
    if (onlyCliente && userData.tipo !== 'cliente') {
      next('/') // ou outra rota para não clientes
      return
    }
    if (onlyProfissional && userData.tipo !== 'profissional') {
      next('/') // ou outra rota para não profissionais
      return
    }
  }

  next()
})

export default router
