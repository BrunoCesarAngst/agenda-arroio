<template>
  <div class="p-4">
    <h2 class="text-xl font-bold mb-4">Teste de Logging</h2>

    <div class="space-y-4">
      <button
        @click="testDebug"
        class="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
      >
        Testar Debug
      </button>

      <button
        @click="testInfo"
        class="bg-blue-200 px-4 py-2 rounded hover:bg-blue-300"
      >
        Testar Info
      </button>

      <button
        @click="testWarn"
        class="bg-yellow-200 px-4 py-2 rounded hover:bg-yellow-300"
      >
        Testar Warning
      </button>

      <button
        @click="testError"
        class="bg-red-200 px-4 py-2 rounded hover:bg-red-300"
      >
        Testar Error
      </button>

      <button
        @click="testCritical"
        class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
      >
        Testar Critical
      </button>
    </div>
  </div>
</template>

<script>
import { logger } from '@/services/logger';

export default {
  name: 'LogTester',

  methods: {
    testDebug() {
      logger.debug('Teste de debug', {
        timestamp: new Date().toISOString(),
        ambiente: import.meta.env.VITE_APP_ENV
      });
    },

    testInfo() {
      logger.info('Teste de informação', {
        usuario: 'teste',
        acao: 'teste_info'
      });
    },

    testWarn() {
      logger.warn('Teste de aviso', {
        recurso: 'teste',
        uso: '85%'
      });
    },

    testError() {
      logger.error('Teste de erro', {
        codigo: 'TEST_001',
        mensagem: 'Erro simulado para teste'
      });
    },

    testCritical() {
      logger.critical('Teste de erro crítico', {
        codigo: 'CRIT_001',
        mensagem: 'Erro crítico simulado para teste',
        stack: new Error().stack
      });
    }
  }
}
</script>