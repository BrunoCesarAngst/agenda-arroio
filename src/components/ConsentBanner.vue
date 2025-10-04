<template>
  <div v-if="showBanner" class="fixed bottom-0 left-0 right-0 bg-white shadow-lg p-4 z-50">
    <div class="max-w-7xl mx-auto">
      <div class="flex flex-col md:flex-row items-center justify-between">
        <div class="mb-4 md:mb-0 md:mr-4">
          <h3 class="text-lg font-semibold mb-2">Política de Privacidade</h3>
          <p class="text-gray-600">
            Utilizamos cookies e dados pessoais para melhorar sua experiência.
            Ao continuar navegando, você concorda com nossa
            <a href="/privacidade" class="text-blue-500 hover:underline">política de privacidade</a>.
          </p>
        </div>

        <div class="flex space-x-4">
          <button
            @click="acceptAll"
            class="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Aceitar Tudo
          </button>
          <button
            @click="customizeConsent"
            class="px-6 py-2 border border-gray-300 rounded hover:bg-gray-50"
          >
            Personalizar
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de Personalização -->
    <div v-if="showCustomizeModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
        <h3 class="text-xl font-semibold mb-4">Personalizar Consentimento</h3>

        <div class="space-y-4">
          <div v-for="(option, index) in consentOptions" :key="index" class="flex items-center justify-between">
            <div>
              <h4 class="font-medium">{{ option.title }}</h4>
              <p class="text-sm text-gray-600">{{ option.description }}</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                v-model="selectedOptions[index]"
                class="sr-only peer"
              >
              <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>

        <div class="mt-6 flex justify-end space-x-4">
          <button
            @click="showCustomizeModal = false"
            class="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            @click="saveCustomConsent"
            class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Salvar Preferências
          </button>
        </div>
      </div>
    </div>

    <div v-if="firestoreError" class="alert alert-warning text-red-600 bg-red-50 border border-red-200 rounded p-2 mt-2">
      {{ firestoreError }}
    </div>
  </div>
</template>

<script>
import { onMounted, ref } from 'vue';
import { consentService } from '../services/consentService';
import useAuthUser from '../useAuthUser';

export default {
  name: 'ConsentBanner',

  setup() {
    const { user } = useAuthUser();
    const showBanner = ref(false);
    const showCustomizeModal = ref(false);
    const selectedOptions = ref([]);
    const firestoreError = ref('');

    const consentOptions = [
      {
        title: 'Cookies Essenciais',
        description: 'Necessários para o funcionamento básico do site',
        type: 'essential'
      },
      {
        title: 'Cookies de Análise',
        description: 'Nos ajudam a entender como você usa o site',
        type: 'analytics'
      },
      {
        title: 'Cookies de Marketing',
        description: 'Usados para personalizar anúncios',
        type: 'marketing'
      }
    ];

    const checkConsent = async () => {
      if (user.value) {
        try {
          const consents = await consentService.getUserConsents(user.value.uid);
          showBanner.value = consents.length === 0;
          firestoreError.value = '';
        } catch (error) {
          firestoreError.value = 'Não foi possível buscar seus consentimentos. Tente novamente mais tarde.';
          console.error('Erro ao verificar consentimentos:', error);
          showBanner.value = true;
        }
      } else {
        showBanner.value = false;
      }
    };

    const acceptAll = async () => {
      if (user.value) {
        try {
          await consentService.registerConsent(user.value.uid, 'all', {
            essential: true,
            analytics: true,
            marketing: true
          });
          showBanner.value = false;
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
            console.error('Erro inesperado ao registrar consentimento:', error);
          }
        }
      }
    };

    const customizeConsent = () => {
      selectedOptions.value = consentOptions.map(() => true);
      showCustomizeModal.value = true;
    };

    const saveCustomConsent = async () => {
      if (user.value) {
        try {
          const consentData = {};
          consentOptions.forEach((option, index) => {
            consentData[option.type] = selectedOptions.value[index];
          });
          await consentService.registerConsent(user.value.uid, 'custom', consentData);
          showCustomizeModal.value = false;
          showBanner.value = false;
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
            console.error('Erro inesperado ao salvar consentimento personalizado:', error);
          }
        }
      }
    };

    onMounted(checkConsent);

    return {
      showBanner,
      showCustomizeModal,
      consentOptions,
      selectedOptions,
      acceptAll,
      customizeConsent,
      saveCustomConsent,
      firestoreError
    };
  }
};
</script>