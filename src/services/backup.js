import { addDoc, collection, doc, getDocs, query, serverTimestamp, updateDoc, where } from 'firebase/firestore';
import { getDownloadURL, getStorage, ref as storageRef, uploadBytes } from 'firebase/storage';
import { db } from './firebase';
import { logger } from './logger';

class BackupService {
  constructor() {
    this.storage = getStorage();
    this.backupConfig = {
      collections: ['usuarios', 'empresas', 'servicos', 'agendamentos'],
      maxBackups: 30, // Manter últimos 30 backups
      retentionPeriod: 30 * 24 * 60 * 60 * 1000 // 30 dias em milissegundos
    };
  }

  // Criar backup manual
  async createManualBackup() {
    try {
      const backupId = await this.createBackupRecord('manual');
      const data = await this.exportData();
      await this.uploadBackup(backupId, data);
      await this.cleanupOldBackups();
      return backupId;
    } catch (error) {
      logger.error('Erro ao criar backup manual', { error: error.message });
      throw error;
    }
  }

  // Criar backup automático
  async createAutomaticBackup() {
    try {
      const backupId = await this.createBackupRecord('automatic');
      const data = await this.exportData();
      await this.uploadBackup(backupId, data);
      await this.cleanupOldBackups();
      return backupId;
    } catch (error) {
      logger.error('Erro ao criar backup automático', { error: error.message });
      throw error;
    }
  }

  // Criar registro do backup
  async createBackupRecord(type) {
    const backupRef = await addDoc(collection(db, 'backups'), {
      timestamp: serverTimestamp(),
      status: 'in_progress',
      size: 0,
      type,
      completedAt: null
    });
    return backupRef.id;
  }

  // Exportar dados do Firestore
  async exportData() {
    const data = {};

    for (const collectionName of this.backupConfig.collections) {
      const snapshot = await getDocs(collection(db, collectionName));
      data[collectionName] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    }

    return data;
  }

  // Upload do backup para Storage
  async uploadBackup(backupId, data) {
    try {
      const backupPath = `backups/${backupId}.json`;
      const backupFileRef = storageRef(this.storage, backupPath);

      const jsonData = JSON.stringify(data);
      await uploadBytes(backupFileRef, jsonData);
      const downloadUrl = await getDownloadURL(backupFileRef);

      await updateDoc(doc(db, 'backups', backupId), {
        status: 'completed',
        size: jsonData.length,
        downloadUrl,
        completedAt: serverTimestamp()
      });

      logger.info('Backup criado com sucesso', { backupId });
    } catch (error) {
      await updateDoc(doc(db, 'backups', backupId), {
        status: 'failed',
        error: error.message
      });
      throw error;
    }
  }

  // Limpar backups antigos
  async cleanupOldBackups() {
    try {
      const cutoffDate = new Date(Date.now() - this.backupConfig.retentionPeriod);

      const backupsRef = collection(db, 'backups');
      const q = query(
        backupsRef,
        where('timestamp', '<', cutoffDate)
      );

      const snapshot = await getDocs(q);
      const deletePromises = snapshot.docs.map(async (doc) => {
        const backup = doc.data();
        if (backup.downloadUrl) {
          const backupFileRef = storageRef(this.storage, `backups/${doc.id}.json`);
          await deleteObject(backupFileRef);
        }
        await deleteDoc(doc.ref);
      });

      await Promise.all(deletePromises);
      logger.info('Limpeza de backups antigos concluída');
    } catch (error) {
      logger.error('Erro ao limpar backups antigos', { error: error.message });
    }
  }

  // Verificar e criar backup automático se necessário
  async checkAndCreateAutomaticBackup() {
    try {
      const lastBackup = await this.getLastAutomaticBackup();
      const now = new Date();

      if (!lastBackup || this.shouldCreateNewBackup(lastBackup, now)) {
        await this.createAutomaticBackup();
      }
    } catch (error) {
      logger.error('Erro ao verificar backup automático', { error: error.message });
    }
  }

  // Obter último backup automático
  async getLastAutomaticBackup() {
    const backupsRef = collection(db, 'backups');
    const q = query(
      backupsRef,
      where('type', '==', 'automatic'),
      where('status', '==', 'completed')
    );

    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;

    return snapshot.docs[0].data();
  }

  // Verificar se deve criar novo backup
  shouldCreateNewBackup(lastBackup, now) {
    if (!lastBackup) return true;

    const lastBackupDate = lastBackup.timestamp.toDate();
    const hoursSinceLastBackup = (now - lastBackupDate) / (1000 * 60 * 60);

    return hoursSinceLastBackup >= 24; // Backup diário
  }
}

export const backupService = new BackupService();