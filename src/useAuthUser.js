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
  const userDoc = await getDoc(doc(db, 'usuarios', firebaseUser.uid))
  if (userDoc.exists()) {
    userData.value = userDoc.data()
  } else {
    userData.value = {
      nome: firebaseUser.displayName || '',
      email: firebaseUser.email || '',
      telefone: '',
      foto: firebaseUser.photoURL || ''
    }
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