<template>
  <div class="privacy-policy">
    <div class="max-w-4xl mx-auto p-6">
      <h1 class="text-3xl font-bold mb-6">Política de Privacidade</h1>

      <div class="space-y-6">
        <section v-for="(section, index) in policySections" :key="index" class="bg-white p-6 rounded-lg shadow">
          <h2 class="text-xl font-semibold mb-4">{{ section.title }}</h2>
          <p class="text-gray-700">{{ section.content }}</p>
        </section>

        <div class="consent-section bg-white p-6 rounded-lg shadow">
          <h2 class="text-xl font-semibold mb-4">Seus Consentimentos</h2>

          <div v-for="consent in userConsents" :key="consent.id" class="mb-4 p-4 border rounded">
            <div class="flex justify-between items-center">
              <div>
                <h3 class="font-medium">{{ consent.consentType }}</h3>
                <p class="text-sm text-gray-600">
                  Data: {{ formatDate(consent.timestamp) }}
                </p>
              </div>
              <button
                v-if="consent.status === 'active'"
                @click="revokeConsent(consent.id)"
                class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Revogar
              </button>
            </div>
          </div>
        </div>

        <div class="actions-section flex justify-end space-x-4">
          <button
            @click="exportData"
            class="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Exportar Meus Dados
          </button>
        </div>
      </div>

      <div v-if="firestoreError" class="alert alert-warning text-red-600 bg-red-50 border border-red-200 rounded p-2 mt-2">
        {{ firestoreError }}
      </div>
    </div>
  </div>
</template>

<script>
import { onMounted, ref } from 'vue';
import { consentService } from '../services/consentService';
import useAuthUser from '../useAuthUser';

export default {
  name: 'PrivacyPolicy',

  setup() {
    const { user } = useAuthUser();
    const userConsents = ref([]);
    const firestoreError = ref('');

    const policySections = [
      {
        title: 'Coleta de Dados',
        content: 'Coletamos apenas os dados necessários para fornecer nossos serviços, incluindo nome, e-mail e informações de uso.'
      },
      {
        title: 'Uso dos Dados',
        content: 'Seus dados são utilizados exclusivamente para os fins informados e com seu consentimento explícito.'
      },
      {
        title: 'Compartilhamento',
        content: 'Não compartilhamos seus dados com terceiros sem seu consentimento prévio.'
      },
      {
        title: 'Seus Direitos',
        content: 'Você tem direito a acessar, corrigir, excluir e exportar seus dados a qualquer momento.'
      }
    ];

    const loadUserConsents = async () => {
      if (user.value) {
        try {
          userConsents.value = await consentService.getUserConsents(user.value.uid);
          firestoreError.value = '';
        } catch (error) {
          firestoreError.value = 'Não foi possível buscar seus consentimentos. Tente novamente mais tarde.';
          console.error('Erro ao carregar consentimentos:', error);
        }
      }
    };

    const revokeConsent = async (consentId) => {
      try {
        await consentService.revokeConsent(consentId);
        await loadUserConsents();
        firestoreError.value = '';
      } catch (error) {
        if (error.code === 'unavailable' || error.message?.includes('Could not reach Cloud Firestore backend')) {
          firestoreError.value = 'Não foi possível conectar ao banco de dados. Tente novamente mais tarde ou contate o suporte.';
          console.error('Não foi possível conectar ao Firestore. Verifique se o emulador está rodando e se a porta está correta.', error);
        } else if (error.code === 'permission-denied') {
          firestoreError.value = 'Você não tem permissão para realizar esta ação. Faça login novamente ou contate o suporte.';
          console.error('Permissão negada ao acessar o Firestore. Verifique as regras e se o usuário está autenticado.', error);
        } else {
          firestoreError.value = 'Ocorreu um erro inesperado. Tente novamente.';
          console.error('Erro inesperado ao revogar consentimento:', error);
        }
      }
    };

    const exportData = async () => {
      if (user.value) {
        try {
          const data = await consentService.exportUserData(user.value.uid);
          const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `meus-dados-${new Date().toISOString()}.json`;
          a.click();
          window.URL.revokeObjectURL(url);
          firestoreError.value = '';
        } catch (error) {
          if (error.code === 'unavailable' || error.message?.includes('Could not reach Cloud Firestore backend')) {
            firestoreError.value = 'Não foi possível conectar ao banco de dados. Tente novamente mais tarde ou contate o suporte.';
            console.error('Não foi possível conectar ao Firestore. Verifique se o emulador está rodando e se a porta está correta.', error);
          } else if (error.code === 'permission-denied') {
            firestoreError.value = 'Você não tem permissão para realizar esta ação. Faça login novamente ou contate o suporte.';
            console.error('Permissão negada ao acessar o Firestore. Verifique as regras e se o usuário está autenticado.', error);
          } else {
            firestoreError.value = 'Ocorreu um erro inesperado. Tente novamente.';
            console.error('Erro inesperado ao exportar dados:', error);
          }
        }
      }
    };

    const formatDate = (date) => {
      return new Date(date).toLocaleDateString('pt-BR');
    };

    onMounted(loadUserConsents);

    return {
      userConsents,
      policySections,
      revokeConsent,
      exportData,
      formatDate,
      firestoreError
    };
  }
};
</script>

<style scoped>
.privacy-policy {
  @apply bg-gray-50 min-h-screen;
}
</style>