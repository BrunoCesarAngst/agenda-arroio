import { addDoc, collection, doc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { db } from './firebase';

class ConsentService {
  constructor() {
    this.consentsCollection = collection(db, 'consents');
  }

  async registerConsent(userId, consentType, consentData) {
    try {
      const consent = {
        userId,
        consentType,
        consentData,
        timestamp: new Date(),
        version: '1.0',
        status: 'active'
      };

      const docRef = await addDoc(this.consentsCollection, consent);
      return { id: docRef.id, ...consent };
    } catch (error) {
      console.error('Erro ao registrar consentimento:', error);
      throw error;
    }
  }

  async getUserConsents(userId) {
    try {
      const q = query(this.consentsCollection, where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Erro ao buscar consentimentos:', error);
      throw error;
    }
  }

  async revokeConsent(consentId) {
    try {
      const consentRef = doc(this.consentsCollection, consentId);
      await updateDoc(consentRef, {
        status: 'revoked',
        revokedAt: new Date()
      });
    } catch (error) {
      console.error('Erro ao revogar consentimento:', error);
      throw error;
    }
  }

  async exportUserData(userId) {
    try {
      const consents = await this.getUserConsents(userId);
      return {
        consents,
        exportDate: new Date(),
        format: 'JSON'
      };
    } catch (error) {
      console.error('Erro ao exportar dados:', error);
      throw error;
    }
  }
}

export const consentService = new ConsentService();