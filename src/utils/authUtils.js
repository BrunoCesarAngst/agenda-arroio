import { auth } from '../services/firebase'

/**
 * Verifica se o usuário está autenticado e com token válido
 * @param {Object} firebaseUser - Usuário do Firebase Auth
 * @param {number} timeout - Timeout em ms para aguardar carregamento
 * @returns {Promise<boolean>} - true se autenticado e válido
 */
export async function verifyUserAuth(firebaseUser, timeout = 5000) {
  if (!firebaseUser) {
    return false
  }

  try {
    // Verifica se o token ainda é válido
    await firebaseUser.getIdToken(true)
    return true
  } catch (error) {
    console.error('Token inválido ou expirado:', error)
    return false
  }
}

/**
 * Aguarda o carregamento dos dados do usuário com timeout
 * @param {Function} checkFunction - Função que verifica se os dados estão prontos
 * @param {number} timeout - Timeout em ms
 * @returns {Promise<boolean>} - true se dados carregados, false se timeout
 */
export function waitForUserData(checkFunction, timeout = 10000) {
  return new Promise((resolve) => {
    const startTime = Date.now()

    const checkInterval = setInterval(() => {
      if (checkFunction()) {
        clearInterval(checkInterval)
        resolve(true)
      } else if (Date.now() - startTime > timeout) {
        clearInterval(checkInterval)
        resolve(false)
      }
    }, 100)
  })
}

/**
 * Verifica se o usuário atual está autenticado
 * @returns {Promise<Object|null>} - Dados do usuário ou null se não autenticado
 */
export async function getCurrentUser() {
  const currentUser = auth.currentUser
  if (!currentUser) {
    return null
  }

  const isValid = await verifyUserAuth(currentUser)
  return isValid ? currentUser : null
}

/**
 * Força logout do usuário se não estiver autenticado
 * @param {Function} router - Função do router para redirecionamento
 */
export async function ensureAuth(router) {
  const user = await getCurrentUser()
  if (!user) {
    if (router) {
      router.push('/login')
    }
    return false
  }
  return true
}
