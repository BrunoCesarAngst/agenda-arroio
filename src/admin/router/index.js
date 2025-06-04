import { createRouter, createWebHistory } from 'vue-router'
import MetricsDashboard from '../components/MetricsDashboard.vue'

const routes = [
  {
    path: '/admin',
    name: 'admin',
    component: () => import('../views/AdminLayout.vue'),
    children: [
      {
        path: 'metrics',
        name: 'metrics',
        component: MetricsDashboard,
        meta: {
          title: 'Métricas',
          requiresAuth: true
        }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Middleware de autenticação
router.beforeEach((to, from, next) => {
  if (to.matched.some(record => record.meta.requiresAuth)) {
    // Verificar se o usuário está autenticado e é admin
    const isAuthenticated = localStorage.getItem('user')
    const isAdmin = JSON.parse(localStorage.getItem('user'))?.isAdmin

    if (!isAuthenticated || !isAdmin) {
      next({
        path: '/login',
        query: { redirect: to.fullPath }
      })
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router