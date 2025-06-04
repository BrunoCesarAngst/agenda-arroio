import { initializeApp } from 'firebase/app'
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check'
import { connectAuthEmulator, getAuth, onAuthStateChanged } from 'firebase/auth'
import { connectDatabaseEmulator, getDatabase } from 'firebase/database'
import { connectFirestoreEmulator, enableIndexedDbPersistence, getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore(app)
const rtdb = getDatabase(app)

// Só conecta aos emuladores se a flag estiver ativada
if (import.meta.env.DEV) {
  connectAuthEmulator(auth, 'http://localhost:9098')
  connectFirestoreEmulator(db, 'localhost', 8081)
  connectDatabaseEmulator(rtdb, 'localhost', 9000)
  console.log('Conectado aos emuladores do Firebase')
}

const storage = getStorage(app)

// Configuração do App Check
const appCheckConfig = {
  provider: new ReCaptchaV3Provider(import.meta.env.VITE_RECAPTCHA_SITE_KEY),
  isTokenAutoRefreshEnabled: true
}

// Ativa AppCheck debug apenas em desenvolvimento
if (import.meta.env.DEV && import.meta.env.VITE_FIREBASE_APPCHECK_DEBUG_TOKEN) {
  self.FIREBASE_APPCHECK_DEBUG_TOKEN = import.meta.env.VITE_FIREBASE_APPCHECK_DEBUG_TOKEN
  console.log('AppCheck Debug Token setado via .env:', self.FIREBASE_APPCHECK_DEBUG_TOKEN)
} else if (import.meta.env.DEV) {
  self.FIREBASE_APPCHECK_DEBUG_TOKEN = true
  console.log('AppCheck Debug Token gerado automaticamente')
}

// Inicializa App Check
const appCheck = initializeAppCheck(app, appCheckConfig)
console.log('AppCheck inicializado:', appCheck)

// Habilita persistência offline
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    console.warn('Persistência offline não disponível - Múltiplas abas abertas')
  } else if (err.code === 'unimplemented') {
    console.warn('Navegador não suporta persistência offline')
  }
})

// Auth state observer
onAuthStateChanged(auth, (user) => {
  if (user) {
    // User is signed in
    console.log('User is signed in:', user.uid)
  } else {
    // User is signed out
    console.log('User is signed out')
  }
})

// Exporta apenas o necessário inicialmente
export { app, appCheck, auth, db, rtdb, storage }

// Exporta funções específicas do Firebase sob demanda
export const getFirebaseAuth = () => import('firebase/auth')
export const getFirebaseFirestore = () => import('firebase/firestore')
export const getFirebaseStorage = () => import('firebase/storage')
