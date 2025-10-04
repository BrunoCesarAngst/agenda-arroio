import { onAuthStateChanged, signOut } from 'firebase/auth'
import { doc, getDoc, getFirestore } from 'firebase/firestore'
import { defineStore } from 'pinia'
import { auth } from '../services/firebase'

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null,
    userData: null,
    loading: true,
    error: null
  }),

  getters: {
    isAuthenticated: (state) => !!state.user,
    isAdmin: (state) => state.userData?.tipo === 'admin',
    isProfissional: (state) => state.userData?.tipo === 'profissional',
    isCliente: (state) => state.userData?.tipo === 'cliente',
    hasCompletedProfile: (state) => !!state.userData?.tipo
  },

  actions: {
    async init() {
      return new Promise((resolve) => {
        // Verifica o estado atual primeiro
        const currentUser = auth.currentUser

        const handleAuthStateChange = async (user) => {
          this.user = user
          this.loading = true
          this.error = null

          if (user) {
            try {
              const db = getFirestore()
              const userDoc = await getDoc(doc(db, 'usuarios', user.uid))
              if (!userDoc.exists()) {
                // Usuário autenticado no Auth, mas não existe no Firestore ainda
                this.userData = {
                  nome: user.displayName || '',
                  email: user.email || '',
                  telefone: '',
                  foto: user.photoURL || '',
                  tipo: null // Marca como perfil incompleto
                }
                this.error = null
              } else {
                this.userData = userDoc.data()
              }
            } catch (err) {
              console.error('Erro ao carregar dados do usuário:', err)
              this.error = 'Erro ao carregar dados do usuário'
            }
          } else {
            this.userData = null
          }

          this.loading = false
          resolve()
        }

        // Se já tem usuário autenticado, processa imediatamente
        if (currentUser) {
          handleAuthStateChange(currentUser)
        } else {
          // Se não tem usuário, configura o listener
          onAuthStateChanged(auth, handleAuthStateChange)
        }
      })
    },

    async logout() {
      try {
        await signOut(auth)
        this.user = null
        this.userData = null
        this.error = null
      } catch (err) {
        console.error('Erro ao fazer logout:', err)
        this.error = 'Erro ao fazer logout'
      }
    },

    async refreshUserData() {
      if (!this.user) return

      try {
        const db = getFirestore()
        const userDoc = await getDoc(doc(db, 'usuarios', this.user.uid))
        this.userData = userDoc.exists() ? userDoc.data() : null
      } catch (err) {
        console.error('Erro ao atualizar dados do usuário:', err)
        this.error = 'Erro ao atualizar dados do usuário'
      }
    }
  }
})