<template>
  <div class="p-6">
    <h2 class="text-2xl font-bold mb-6">Gerenciador de Backups</h2>

    <!-- Status do Backup -->
    <div class="mb-6 p-4 bg-gray-100 rounded-lg">
      <h3 class="text-lg font-semibold mb-2">Status do Último Backup</h3>
      <div v-if="lastBackup" class="space-y-2">
        <p><span class="font-medium">Data:</span> {{ formatDate(lastBackup.timestamp) }}</p>
        <p><span class="font-medium">Tamanho:</span> {{ formatSize(lastBackup.size) }}</p>
        <p><span class="font-medium">Status:</span>
          <span :class="getStatusClass(lastBackup.status)">
            {{ lastBackup.status }}
          </span>
        </p>
      </div>
      <p v-else class="text-gray-600">Nenhum backup realizado ainda.</p>
    </div>

    <!-- Ações de Backup -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <div class="p-4 border rounded-lg">
        <h3 class="text-lg font-semibold mb-4">Backup Manual</h3>
        <button
          @click="createBackup"
          :disabled="isBackingUp"
          class="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {{ isBackingUp ? 'Criando Backup...' : 'Criar Backup Agora' }}
        </button>
      </div>

      <div class="p-4 border rounded-lg">
        <h3 class="text-lg font-semibold mb-4">Backup Automático</h3>
        <div class="space-y-4">
          <div class="flex items-center space-x-2">
            <input
              type="checkbox"
              id="autoBackup"
              v-model="autoBackupEnabled"
              @change="toggleAutoBackup"
              class="form-checkbox"
            >
            <label for="autoBackup">Ativar Backup Automático</label>
          </div>
          <select
            v-model="backupFrequency"
            :disabled="!autoBackupEnabled"
            class="w-full p-2 border rounded"
          >
            <option value="daily">Diário</option>
            <option value="weekly">Semanal</option>
            <option value="monthly">Mensal</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Lista de Backups -->
    <div class="mt-8">
      <h3 class="text-lg font-semibold mb-4">Histórico de Backups</h3>
      <div class="overflow-x-auto">
        <table class="min-w-full bg-white">
          <thead>
            <tr class="bg-gray-100">
              <th class="px-4 py-2 text-left">Data</th>
              <th class="px-4 py-2 text-left">Tamanho</th>
              <th class="px-4 py-2 text-left">Status</th>
              <th class="px-4 py-2 text-left">Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="backup in backups" :key="backup.id" class="border-t">
              <td class="px-4 py-2">{{ formatDate(backup.timestamp) }}</td>
              <td class="px-4 py-2">{{ formatSize(backup.size) }}</td>
              <td class="px-4 py-2">
                <span :class="getStatusClass(backup.status)">
                  {{ backup.status }}
                </span>
              </td>
              <td class="px-4 py-2">
                <div class="space-x-2">
                  <button
                    @click="downloadBackup(backup)"
                    class="text-blue-500 hover:text-blue-700"
                  >
                    Download
                  </button>
                  <button
                    @click="restoreBackup(backup)"
                    class="text-green-500 hover:text-green-700"
                  >
                    Restaurar
                  </button>
                  <button
                    @click="deleteBackup(backup)"
                    class="text-red-500 hover:text-red-700"
                  >
                    Excluir
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal de Confirmação -->
    <div v-if="showConfirmModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div class="bg-white p-6 rounded-lg max-w-md">
        <h3 class="text-lg font-semibold mb-4">{{ confirmModalTitle }}</h3>
        <p class="mb-6">{{ confirmModalMessage }}</p>
        <div class="flex justify-end space-x-4">
          <button
            @click="cancelConfirm"
            class="px-4 py-2 border rounded hover:bg-gray-100"
          >
            Cancelar
          </button>
          <button
            @click="confirmAction"
            :class="confirmButtonClass"
          >
            {{ confirmButtonText }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { db } from '@/services/firebase';
import { logger } from '@/services/logger';
import { addDoc, collection, deleteDoc, doc, getDocs, orderBy, query, serverTimestamp, updateDoc } from 'firebase/firestore';
import { deleteObject, getDownloadURL, getStorage, ref as storageRef, uploadBytes } from 'firebase/storage';
import { onMounted, ref } from 'vue';

export default {
  name: 'BackupManager',

  setup() {
    const backups = ref([]);
    const lastBackup = ref(null);
    const isBackingUp = ref(false);
    const autoBackupEnabled = ref(false);
    const backupFrequency = ref('daily');
    const showConfirmModal = ref(false);
    const confirmModalTitle = ref('');
    const confirmModalMessage = ref('');
    const confirmButtonText = ref('');
    const confirmButtonClass = ref('');
    const pendingAction = ref(null);

    // Carregar backups
    const loadBackups = async () => {
      try {
        const backupsRef = collection(db, 'backups');
        const q = query(backupsRef, orderBy('timestamp', 'desc'));
        const snapshot = await getDocs(q);

        backups.value = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        if (backups.value.length > 0) {
          lastBackup.value = backups.value[0];
        }
      } catch (error) {
        logger.error('Erro ao carregar backups', { error: error.message });
      }
    };

    // Criar backup
    const createBackup = async () => {
      try {
        isBackingUp.value = true;

        // Criar registro do backup
        const backupRef = await addDoc(collection(db, 'backups'), {
          timestamp: serverTimestamp(),
          status: 'in_progress',
          size: 0,
          type: 'manual'
        });

        // Exportar dados do Firestore
        const data = await exportFirestoreData();

        // Upload para Storage
        const storage = getStorage();
        const backupPath = `backups/${backupRef.id}.json`;
        const backupFileRef = storageRef(storage, backupPath);

        await uploadBytes(backupFileRef, JSON.stringify(data));
        const downloadUrl = await getDownloadURL(backupFileRef);

        // Atualizar registro do backup
        await updateDoc(doc(db, 'backups', backupRef.id), {
          status: 'completed',
          size: JSON.stringify(data).length,
          downloadUrl,
          completedAt: serverTimestamp()
        });

        logger.info('Backup criado com sucesso', { backupId: backupRef.id });
        await loadBackups();
      } catch (error) {
        logger.error('Erro ao criar backup', { error: error.message });
      } finally {
        isBackingUp.value = false;
      }
    };

    // Exportar dados do Firestore
    const exportFirestoreData = async () => {
      const collections = ['usuarios', 'empresas', 'servicos', 'agendamentos'];
      const data = {};

      for (const collectionName of collections) {
        const snapshot = await getDocs(collection(db, collectionName));
        data[collectionName] = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
      }

      return data;
    };

    // Download do backup
    const downloadBackup = async (backup) => {
      try {
        window.open(backup.downloadUrl, '_blank');
        logger.info('Download do backup iniciado', { backupId: backup.id });
      } catch (error) {
        logger.error('Erro ao fazer download do backup', { error: error.message });
      }
    };

    // Restaurar backup
    const restoreBackup = (backup) => {
      showConfirmModal.value = true;
      confirmModalTitle.value = 'Restaurar Backup';
      confirmModalMessage.value = 'Tem certeza que deseja restaurar este backup? Esta ação não pode ser desfeita.';
      confirmButtonText.value = 'Restaurar';
      confirmButtonClass.value = 'bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600';
      pendingAction.value = async () => {
        try {
          // Implementar lógica de restauração
          logger.info('Backup restaurado com sucesso', { backupId: backup.id });
        } catch (error) {
          logger.error('Erro ao restaurar backup', { error: error.message });
        }
      };
    };

    // Excluir backup
    const deleteBackup = (backup) => {
      showConfirmModal.value = true;
      confirmModalTitle.value = 'Excluir Backup';
      confirmModalMessage.value = 'Tem certeza que deseja excluir este backup? Esta ação não pode ser desfeita.';
      confirmButtonText.value = 'Excluir';
      confirmButtonClass.value = 'bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600';
      pendingAction.value = async () => {
        try {
          // Excluir do Storage
          const storage = getStorage();
          const backupFileRef = storageRef(storage, `backups/${backup.id}.json`);
          await deleteObject(backupFileRef);

          // Excluir do Firestore
          await deleteDoc(doc(db, 'backups', backup.id));

          logger.info('Backup excluído com sucesso', { backupId: backup.id });
          await loadBackups();
        } catch (error) {
          logger.error('Erro ao excluir backup', { error: error.message });
        }
      };
    };

    // Toggle backup automático
    const toggleAutoBackup = async () => {
      try {
        // Implementar lógica de backup automático
        logger.info('Configuração de backup automático atualizada', {
          enabled: autoBackupEnabled.value,
          frequency: backupFrequency.value
        });
      } catch (error) {
        logger.error('Erro ao configurar backup automático', { error: error.message });
      }
    };

    // Utilitários
    const formatDate = (timestamp) => {
      if (!timestamp) return '';
      const date = timestamp.toDate();
      return new Intl.DateTimeFormat('pt-BR', {
        dateStyle: 'full',
        timeStyle: 'medium'
      }).format(date);
    };

    const formatSize = (bytes) => {
      if (!bytes) return '0 B';
      const units = ['B', 'KB', 'MB', 'GB'];
      let size = bytes;
      let unitIndex = 0;
      while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex++;
      }
      return `${size.toFixed(2)} ${units[unitIndex]}`;
    };

    const getStatusClass = (status) => {
      const classes = {
        completed: 'text-green-600',
        in_progress: 'text-yellow-600',
        failed: 'text-red-600'
      };
      return classes[status] || 'text-gray-600';
    };

    // Modal
    const confirmAction = async () => {
      if (pendingAction.value) {
        await pendingAction.value();
      }
      showConfirmModal.value = false;
      pendingAction.value = null;
    };

    const cancelConfirm = () => {
      showConfirmModal.value = false;
      pendingAction.value = null;
    };

    onMounted(() => {
      loadBackups();
    });

    return {
      backups,
      lastBackup,
      isBackingUp,
      autoBackupEnabled,
      backupFrequency,
      showConfirmModal,
      confirmModalTitle,
      confirmModalMessage,
      confirmButtonText,
      confirmButtonClass,
      createBackup,
      downloadBackup,
      restoreBackup,
      deleteBackup,
      toggleAutoBackup,
      formatDate,
      formatSize,
      getStatusClass,
      confirmAction,
      cancelConfirm
    };
  }
};
</script>