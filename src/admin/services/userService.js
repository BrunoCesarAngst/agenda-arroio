import { db } from '@/services/firebase'
import { addDoc, collection, deleteDoc, doc, getDocs, query, updateDoc, where } from 'firebase/firestore'

export const userService = {
  async getAllUsers() {
    const usersRef = collection(db, 'users')
    const snapshot = await getDocs(usersRef)
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  },

  async getUserById(userId) {
    const userRef = doc(db, 'users', userId)
    const userDoc = await getDocs(userRef)
    if (userDoc.exists()) {
      return {
        id: userDoc.id,
        ...userDoc.data()
      }
    }
    return null
  },

  async createUser(userData) {
    const usersRef = collection(db, 'users')
    const docRef = await addDoc(usersRef, {
      ...userData,
      createdAt: new Date(),
      status: 'active'
    })
    return docRef.id
  },

  async updateUser(userId, userData) {
    const userRef = doc(db, 'users', userId)
    await updateDoc(userRef, {
      ...userData,
      updatedAt: new Date()
    })
  },

  async deleteUser(userId) {
    const userRef = doc(db, 'users', userId)
    await deleteDoc(userRef)
  },

  async getUsersByRole(role) {
    const usersRef = collection(db, 'users')
    const q = query(usersRef, where('role', '==', role))
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  },

  async getActiveUsers() {
    const usersRef = collection(db, 'users')
    const q = query(usersRef, where('status', '==', 'active'))
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  }
}