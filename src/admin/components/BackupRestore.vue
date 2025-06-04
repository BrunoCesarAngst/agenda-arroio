<template>
  <div class="p-6">
    <h2 class="text-2xl font-bold mb-6">Restaurar Backup</h2>

    <!-- Upload de Backup -->
    <div class="mb-8 p-4 border rounded-lg">
      <h3 class="text-lg font-semibold mb-4">Restaurar de Arquivo</h3>
      <div class="space-y-4">
        <div class="flex items-center space-x-4">
          <input
            type="file"
            ref="fileInput"
            accept=".json"
            @change="handleFileSelect"
            class="hidden"
          >
          <button
            @click="$refs.fileInput.click()"
            class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Selecionar Arquivo
          </button>
          <span v-if="selectedFile" class="text-gray-600">
            {{ selectedFile.name }}
          </span>
        </div>
        <button
          v-if="selectedFile"
          @click="restoreFromFile"
          :disabled="isRestoring"
          class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
        >
          {{ isRestoring ? 'Restaurando...' : 'Restaurar Backup' }}
        </button>
      </div>
    </div>

    <!-- Restaurar de URL -->
    <div class="mb-8 p-4 border rounded-lg">
      <h3 class="text-lg font-semibold mb-4">Restaurar de URL</h3>
      <div class="space-y-4">
        <div class="flex items-center space-x-4">
          <input
            v-model="backupUrl"
            type="text"
            placeholder="URL do backup"
            class="flex-1 p-2 border rounded"
          >
          <button
            @click="restoreFromUrl"
            :disabled="!backupUrl || isRestoring"
            class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
          >
            {{ isRestoring ? 'Restaurando...' : 'Restaurar Backup' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Status da Restauração -->
    <div v-if="restoreStatus" class="mt-6 p-4 rounded-lg" :class="getStatusClass(restoreStatus.type)">
      <h4 class="font-semibold mb-2">{{ restoreStatus.title }}</h4>
      <p>{{ restoreStatus.message }}</p>
      <div v-if="restoreStatus.details" class="mt-2 text-sm">
        <pre class="bg-gray-100 p-2 rounded overflow-x-auto">{{ restoreStatus.details }}</pre>
      </div>
    </div>

    <!-- Modal de Confirmação -->
    <div v-if="showConfirmModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div class="bg-white p-6 rounded-lg max-w-md">
        <h3 class="text-lg font-semibold mb-4">Confirmar Restauração</h3>
        <p class="mb-6">
          Esta ação irá substituir todos os dados atuais. Tem certeza que deseja continuar?
        </p>
        <div class="flex justify-end space-x-4">
          <button
            @click="cancelRestore"
            class="px-4 py-2 border rounded hover:bg-gray-100"
          >
            Cancelar
          </button>
          <button
            @click="confirmRestore"
            class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Confirmar Restauração
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { db } from '@/services/firebase';
import { logger } from '@/services/logger';
import { doc, writeBatch } from 'firebase/firestore';
import { ref } from 'vue';

export default {
  name: 'BackupRestore',

  setup() {
    const fileInput = ref(null);
    const selectedFile = ref(null);
    const backupUrl = ref('');
    const isRestoring = ref(false);
    const showConfirmModal = ref(false);
    const restoreStatus = ref(null);
    const pendingRestoreData = ref(null);

    // Manipular seleção de arquivo
    const handleFileSelect = (event) => {
      const file = event.target.files[0];
      if (file && file.type === 'application/json') {
        selectedFile.value = file;
      } else {
        selectedFile.value = null;
        restoreStatus.value = {
          type: 'error',
          title: 'Erro',
          message: 'Por favor, selecione um arquivo JSON válido.'
        };
      }
    };

    // Ler arquivo JSON
    const readJsonFile = (file) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = JSON.parse(e.target.result);
            resolve(data);
          } catch (error) {
            reject(new Error('Arquivo JSON inválido'));
          }
        };
        reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
        reader.readAsText(file);
      });
    };

    // Baixar backup da URL
    const downloadBackup = async (url) => {
      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Erro ao baixar backup');
        return await response.json();
      } catch (error) {
        throw new Error('Erro ao baixar backup: ' + error.message);
      }
    };

    // Restaurar backup
    const restoreBackup = async (data) => {
      try {
        isRestoring.value = true;
        restoreStatus.value = {
          type: 'info',
          title: 'Restaurando Backup',
          message: 'Iniciando processo de restauração...'
        };

        const batch = writeBatch(db);
        let totalDocs = 0;

        // Restaurar cada coleção
        for (const [collectionName, documents] of Object.entries(data)) {
          restoreStatus.value.message = `Restaurando coleção: ${collectionName}`;

          for (const docData of documents) {
            const { id, ...docFields } = docData;
            const docRef = doc(db, collectionName, id);
            batch.set(docRef, docFields);
            totalDocs++;
          }
        }

        await batch.commit();

        restoreStatus.value = {
          type: 'success',
          title: 'Backup Restaurado',
          message: `Restauração concluída com sucesso. ${totalDocs} documentos restaurados.`
        };

        logger.info('Backup restaurado com sucesso', { totalDocs });
      } catch (error) {
        restoreStatus.value = {
          type: 'error',
          title: 'Erro na Restauração',
          message: 'Ocorreu um erro durante a restauração.',
          details: error.message
        };
        logger.error('Erro ao restaurar backup', { error: error.message });
      } finally {
        isRestoring.value = false;
      }
    };

    // Restaurar de arquivo
    const restoreFromFile = async () => {
      try {
        const data = await readJsonFile(selectedFile.value);
        pendingRestoreData.value = data;
        showConfirmModal.value = true;
      } catch (error) {
        restoreStatus.value = {
          type: 'error',
          title: 'Erro',
          message: error.message
        };
      }
    };

    // Restaurar de URL
    const restoreFromUrl = async () => {
      try {
        const data = await downloadBackup(backupUrl.value);
        pendingRestoreData.value = data;
        showConfirmModal.value = true;
      } catch (error) {
        restoreStatus.value = {
          type: 'error',
          title: 'Erro',
          message: error.message
        };
      }
    };

    // Confirmar restauração
    const confirmRestore = async () => {
      showConfirmModal.value = false;
      if (pendingRestoreData.value) {
        await restoreBackup(pendingRestoreData.value);
        pendingRestoreData.value = null;
      }
    };

    // Cancelar restauração
    const cancelRestore = () => {
      showConfirmModal.value = false;
      pendingRestoreData.value = null;
    };

    // Utilitários
    const getStatusClass = (type) => {
      const classes = {
        success: 'bg-green-100 text-green-800',
        error: 'bg-red-100 text-red-800',
        info: 'bg-blue-100 text-blue-800'
      };
      return classes[type] || 'bg-gray-100 text-gray-800';
    };

    return {
      fileInput,
      selectedFile,
      backupUrl,
      isRestoring,
      showConfirmModal,
      restoreStatus,
      handleFileSelect,
      restoreFromFile,
      restoreFromUrl,
      confirmRestore,
      cancelRestore,
      getStatusClass
    };
  }
};
</script>