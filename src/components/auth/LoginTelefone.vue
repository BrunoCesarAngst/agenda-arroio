<template>
  <div class="space-y-4">
    <div v-if="!verificationId">
      <label for="phone" class="block text-sm font-medium text-gray-700">Telefone</label>
      <input
        type="tel"
        id="phone"
        v-model="phone"
        ref="phoneInput"
        placeholder="(51) 99999-9999"
        required
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
      />
      <small class="text-xs text-gray-500">Formato: (DDD) 9XXXX-XXXX</small>
      <button
        @click="handleSendCode"
        :disabled="loading"
        class="mt-2 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
      >
        {{ loading ? 'Enviando...' : 'Enviar código' }}
      </button>
      <div id="recaptcha-container"></div>
    </div>

    <div v-else>
      <label for="code" class="block text-sm font-medium text-gray-700">Código de verificação</label>
      <input
        type="text"
        id="code"
        v-model="verificationCode"
        placeholder="123456"
        required
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
      />
      <button
        @click="handleVerifyCode"
        :disabled="loading"
        class="mt-2 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
      >
        {{ loading ? 'Verificando...' : 'Verificar código' }}
      </button>
    </div>

    <p v-if="error" class="text-red-500 text-sm text-center">{{ error }}</p>
  </div>
</template>

<script setup>
import { auth } from '../../services/firebase'
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth'
import { ref, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import IMask from 'imask'

const router = useRouter()
const phone = ref('')
const phoneInput = ref(null)
const verificationCode = ref('')
const verificationId = ref('')
const confirmationResult = ref(null)
const loading = ref(false)
const error = ref('')

let recaptchaVerifier = null

// Máscara do telefone
onMounted(() => {
  nextTick(() => {
    if (phoneInput.value) {
      IMask(phoneInput.value, {
        mask: '(00) 00000-0000'
      })
    }
  })
})

// Formata o telefone pro padrão Firebase (+55...)
function formatPhoneNumber(raw) {
  let nums = raw.replace(/\D/g, '')
  if (nums.length === 11) {
    nums = '55' + nums // Adiciona o código do Brasil
  }
  return '+' + nums
}

const handleSendCode = async () => {
  try {
    loading.value = true
    error.value = ''

    // Formatar telefone
    const formattedPhone = formatPhoneNumber(phone.value)

    // Validação básica
    if (!formattedPhone.match(/^\+55\d{11}$/)) {
      error.value = 'Digite o telefone corretamente: (DDD) 9XXXX-XXXX'
      return
    }

    // Configurar reCAPTCHA (cria só uma vez)
    if (!recaptchaVerifier) {
      recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible'
      })
      await recaptchaVerifier.render()
    }

    // Enviar código SMS
    confirmationResult.value = await signInWithPhoneNumber(auth, formattedPhone, recaptchaVerifier)
    verificationId.value = confirmationResult.value.verificationId
  } catch (err) {
    error.value = tratarErroSMS(err)
    console.error('Erro ao enviar código:', err)
  } finally {
    loading.value = false
  }
}

const handleVerifyCode = async () => {
  try {
    loading.value = true
    error.value = ''

    if (!verificationCode.value) {
      error.value = 'Digite o código recebido por SMS'
      return
    }

    // Usar confirmationResult para verificar
    await confirmationResult.value.confirm(verificationCode.value)
    router.push('/home')
  } catch (err) {
    error.value = 'Código inválido ou expirado.'
    console.error('Erro ao verificar código:', err)
  } finally {
    loading.value = false
  }
}

// Mensagens de erro amigáveis
function tratarErroSMS(error) {
  switch (error.code) {
    case "auth/invalid-phone-number":
      return "Número de telefone inválido."
    case "auth/too-many-requests":
      return "Muitas tentativas. Tente novamente mais tarde."
    case "auth/missing-phone-number":
      return "Digite o telefone."
    case "auth/quota-exceeded":
      return "Limite de SMS atingido. Tente mais tarde."
    default:
      return "Erro ao enviar código: " + error.message
  }
}
</script>
