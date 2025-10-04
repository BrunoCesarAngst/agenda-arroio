import { doc, getDoc, getFirestore } from 'firebase/firestore'
import { onUnmounted, ref } from 'vue'
import { auth } from './services/firebase'

const user = ref(null)
const userData = ref(null)
const loading = ref(true)
const db = getFirestore()
let unsubscribe = null

async function fetchUserData(firebaseUser) {
  if (!firebaseUser) {
    userData.value = null
    return
  }

  try {
    // Verifica se o token ainda é válido antes de buscar dados
    await firebaseUser.getIdToken(true)

    const userDoc = await getDoc(doc(db, 'usuarios', firebaseUser.uid))
    if (userDoc.exists()) {
      userData.value = userDoc.data()
    } else {
      // Usuário autenticado mas não existe no Firestore
      userData.value = {
        nome: firebaseUser.displayName || '',
        email: firebaseUser.email || '',
        telefone: '',
        foto: firebaseUser.photoURL || '',
        // Marca como perfil incompleto
        tipo: null
      }
    }
  } catch (error) {
    console.error('Erro ao buscar dados do usuário:', error)
    // Se der erro no token, limpa os dados
    userData.value = null
  }
}

function useAuthUser() {
  if (!unsubscribe) {
    unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      user.value = firebaseUser
      loading.value = false
      await fetchUserData(firebaseUser)
    })
  }

  onUnmounted(() => {
    if (unsubscribe) unsubscribe()
  })

  return {
    user,
    userData,
    loading
  }
}

export default useAuthUser