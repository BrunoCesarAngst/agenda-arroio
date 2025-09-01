import { getAuth } from 'firebase/auth'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

export const useAuthMiddleware = () => {
  const router = useRouter()
  const auth = getAuth()
  const isAdmin = ref(false)

  const checkAdminAccess = async () => {
    const user = auth.currentUser

    if (!user) {
      router.push('/login')
      return false
    }

    // Verificar se o usuário tem papel de administrador
    const userDoc = await db.collection('users').doc(user.uid).get()
    const userData = userDoc.data()

    if (!userData || userData.role !== 'admin') {
      router.push('/')
      return false
    }

    isAdmin.value = true
    return true
  }

  const requireAdmin = async (to, from, next) => {
    const hasAccess = await checkAdminAccess()
    if (hasAccess) {
      next()
    } else {
      next(false)
    }
  }

  return {
    isAdmin,
    checkAdminAccess,
    requireAdmin
  }
}