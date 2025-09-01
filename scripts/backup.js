const { initializeApp } = require('firebase/app');
const { getFirestore, collection, query, where, getDocs, addDoc, updateDoc, doc, serverTimestamp } = require('firebase/firestore');
const { getStorage, ref, uploadBytes, getDownloadURL } = require('firebase/storage');
const cron = require('node-cron');
const dotenv = require('dotenv');

// Carregar variáveis de ambiente
dotenv.config();

// Configuração do Firebase
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
  measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

// Configuração do backup
const backupConfig = {
  collections: ['usuarios', 'empresas', 'servicos', 'agendamentos'],
  maxBackups: 30, // Manter últimos 30 backups
  retentionPeriod: 30 * 24 * 60 * 60 * 1000 // 30 dias em milissegundos
};

// Criar backup
async function createBackup() {
  try {
    console.log('Iniciando backup...');

    // Criar registro do backup
    const backupRef = await addDoc(collection(db, 'backups'), {
      timestamp: serverTimestamp(),
      status: 'in_progress',
      size: 0,
      type: 'automatic',
      completedAt: null
    });

    // Exportar dados
    const data = await exportData();

    // Upload para Storage
    const backupPath = `backups/${backupRef.id}.json`;
    const backupFileRef = ref(storage, backupPath);

    await uploadBytes(backupFileRef, JSON.stringify(data));
    const downloadUrl = await getDownloadURL(backupFileRef);

    // Atualizar registro do backup
    await updateDoc(doc(db, 'backups', backupRef.id), {
      status: 'completed',
      size: JSON.stringify(data).length,
      downloadUrl,
      completedAt: serverTimestamp()
    });

    console.log('Backup concluído com sucesso:', backupRef.id);

    // Limpar backups antigos
    await cleanupOldBackups();
  } catch (error) {
    console.error('Erro ao criar backup:', error);
  }
}

// Exportar dados do Firestore
async function exportData() {
  const data = {};

  for (const collectionName of backupConfig.collections) {
    const snapshot = await getDocs(collection(db, collectionName));
    data[collectionName] = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  }

  return data;
}

// Limpar backups antigos
async function cleanupOldBackups() {
  try {
    const cutoffDate = new Date(Date.now() - backupConfig.retentionPeriod);

    const backupsRef = collection(db, 'backups');
    const q = query(
      backupsRef,
      where('timestamp', '<', cutoffDate)
    );

    const snapshot = await getDocs(q);
    const deletePromises = snapshot.docs.map(async (doc) => {
      const backup = doc.data();
      if (backup.downloadUrl) {
        const backupFileRef = ref(storage, `backups/${doc.id}.json`);
        await deleteObject(backupFileRef);
      }
      await deleteDoc(doc.ref);
    });

    await Promise.all(deletePromises);
    console.log('Limpeza de backups antigos concluída');
  } catch (error) {
    console.error('Erro ao limpar backups antigos:', error);
  }
}

// Agendar backup diário
cron.schedule('0 0 * * *', () => {
  console.log('Executando backup agendado...');
  createBackup();
});

// Executar backup imediatamente se solicitado
if (process.argv.includes('--now')) {
  createBackup();
}

console.log('Serviço de backup iniciado. Aguardando agendamento...');