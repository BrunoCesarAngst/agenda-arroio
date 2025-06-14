// router/index.js

import { doc, getDoc, getFirestore } from 'firebase/firestore'
import { createRouter, createWebHistory } from 'vue-router'
import { auth } from '../services/firebase'

// Importe suas páginas/components principais
import WelcomePage from '../WelcomePage.vue'
import PrivacyPolicy from '../components/PrivacyPolicy.vue'
import AdminLogin from '../pages/AdminLogin.vue'
import CadastroPage from '../pages/CadastroComplementar.vue'
import DashboardPage from '../pages/Dashboard.vue'
import DashboardProfissional from '../pages/DashboardProfissional.vue'
import Home from '../pages/Home.vue'
import LoginPage from '../pages/LoginPage.vue'
import RegisterPage from '../pages/RegisterPage.vue'

// Importando componentes administrativos
import BackupManager from '@/admin/components/BackupManager.vue'
import BackupRestore from '@/admin/components/BackupRestore.vue'
import AdminLayout from '@/admin/views/AdminLayout.vue'
import AdminDashboard from '@/admin/views/Dashboard.vue'
import Settings from '@/admin/views/Settings.vue'
import SystemLogs from '@/admin/views/SystemLogs.vue'
import UserManagement from '@/admin/views/UserManagement.vue'

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
    path: '/admin-login',
    name: 'AdminLogin',
    component: AdminLogin,
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
  },
  {
    path: '/privacidade',
    name: 'PrivacyPolicy',
    component: PrivacyPolicy,
    meta: {
      requiresAuth: false
    }
  },
  // Rotas Administrativas
  {
    path: '/admin',
    component: AdminLayout,
    meta: { requiresAuth: true, requiresAdmin: true },
    children: [
      {
        path: '',
        name: 'admin-dashboard',
        component: AdminDashboard
      },
      {
        path: 'users',
        name: 'admin-users',
        component: UserManagement
      },
      {
        path: 'settings',
        name: 'admin-settings',
        component: Settings
      },
      {
        path: 'logs',
        name: 'admin-logs',
        component: SystemLogs
      },
      {
        path: 'backup',
        name: 'BackupManager',
        component: BackupManager,
        meta: {
          requiresAuth: true,
          requiresAdmin: true
        }
      },
      {
        path: 'backup/restore',
        name: 'BackupRestore',
        component: BackupRestore,
        meta: {
          requiresAuth: true,
          requiresAdmin: true
        }
      }
    ]
  }
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
  const requiresAdmin = to.meta.requiresAdmin
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

    // Verificação de acesso administrativo
    if (requiresAdmin && userData.tipo !== 'admin') {
      next('/') // Redireciona para home se não for admin
      return
    }

    // Proteção por tipo de usuário
    if (onlyCliente && userData.tipo !== 'cliente') {
      next('/')
      return
    }
    if (onlyProfissional && userData.tipo !== 'profissional') {
      next('/')
      return
    }
  }

  next()
})

export default router
