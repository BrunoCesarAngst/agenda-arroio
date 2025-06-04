<template>
  <HeaderProfissional :empresa="empresa" />
  <div class="min-h-screen bg-gradient-to-b from-blue-50 to-white pt-8 flex flex-col items-center">
    <div class="w-full max-w-3xl space-y-8">
      <!-- Cabeçalho da Página -->
      <div class="flex justify-between items-center">
        <h2 class="text-2xl font-bold text-blue-800">Configurações do Perfil</h2>
        <button
          v-if="!editando"
          @click="iniciarEdicao"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <span>✏️</span>
          <span>Editar Perfil</span>
        </button>
      </div>

      <!-- Formulário de Perfil -->
      <div class="bg-white p-6 rounded-xl shadow">
        <div v-if="loading" class="text-center py-4">
          <p class="text-gray-600">Carregando dados...</p>
        </div>
        <div v-else-if="error" class="text-center py-4">
          <p class="text-red-600">{{ error }}</p>
        </div>
        <form v-else @submit.prevent="salvarPerfil" class="space-y-6" v-if="!loading && formEmpresa">
          <!-- Informações Básicas -->
          <div class="space-y-4">
            <h3 class="text-lg font-semibold text-blue-800">Informações Básicas</h3>

            <div>
              <label class="block text-sm font-medium text-gray-700">Nome da Empresa</label>
              <input
                v-model="formEmpresa.nome"
                type="text"
                required
                :disabled="!editando"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Descrição</label>
              <textarea
                v-model="formEmpresa.descricao"
                required
                rows="3"
                :disabled="!editando"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100"
              ></textarea>
            </div>

            <div class="grid grid-cols-2 gap-2">
              <div><label class="block text-sm font-medium text-gray-700">Rua</label><input v-model="formEmpresa.endereco.rua" :disabled="!editando" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100" /></div>
              <div><label class="block text-sm font-medium text-gray-700">Número</label><input v-model="formEmpresa.endereco.numero" :disabled="!editando" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100" /></div>
              <div><label class="block text-sm font-medium text-gray-700">Bairro</label><input v-model="formEmpresa.endereco.bairro" :disabled="!editando" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100" /></div>
              <div><label class="block text-sm font-medium text-gray-700">Complemento</label><input v-model="formEmpresa.endereco.complemento" :disabled="!editando" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100" /></div>
              <div><label class="block text-sm font-medium text-gray-700">Referência</label><input v-model="formEmpresa.endereco.referencia" :disabled="!editando" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100" /></div>
              <div><label class="block text-sm font-medium text-gray-700">CEP</label><input v-model="formEmpresa.endereco.cep" :disabled="!editando" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100" /></div>
              <div><label class="block text-sm font-medium text-gray-700">Cidade</label><input v-model="formEmpresa.endereco.cidade" :disabled="!editando" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100" /></div>
              <div><label class="block text-sm font-medium text-gray-700">Estado</label><input v-model="formEmpresa.endereco.estado" :disabled="!editando" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100" /></div>
              <div><label class="block text-sm font-medium text-gray-700">Nome do contato</label><input v-model="formEmpresa.endereco.contato.nome" :disabled="!editando" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100" /></div>
              <div><label class="block text-sm font-medium text-gray-700">Telefone do contato</label><input v-model="formEmpresa.endereco.contato.telefone" :disabled="!editando" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100" /></div>
            </div>
          </div>

          <!-- Contato -->
          <div class="space-y-4">
            <h3 class="text-lg font-semibold text-blue-800">Contato</h3>

            <div>
              <label class="block text-sm font-medium text-gray-700">Telefone</label>
              <input
                v-model="formEmpresa.telefone"
                type="tel"
                required
                :disabled="!editando"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Email</label>
              <input
                v-model="formEmpresa.email"
                type="email"
                required
                :disabled="!editando"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>
          </div>

          <!-- Horário de Funcionamento -->
          <div class="space-y-4">
            <h3 class="text-lg font-semibold text-blue-800">Horário de Funcionamento</h3>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">Abertura</label>
                <input
                  v-model="formEmpresa.horarioAbertura"
                  type="time"
                  required
                  :disabled="!editando"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">Fechamento</label>
                <input
                  v-model="formEmpresa.horarioFechamento"
                  type="time"
                  required
                  :disabled="!editando"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>
            </div>
          </div>

          <!-- Botões de Ação -->
          <div v-if="editando" class="flex justify-end space-x-3">
            <button
              type="button"
              @click="cancelarEdicao"
              class="px-4 py-2 text-gray-700 hover:text-gray-900"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Salvar Alterações
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { signOut } from 'firebase/auth'
import { doc, getDoc, getFirestore, updateDoc } from 'firebase/firestore'
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import HeaderProfissional from '../../components/HeaderProfissional.vue'
import { auth } from '../../services/firebase'
import useAuthUser from '../../useAuthUser'

const router = useRouter()
const { user, userData } = useAuthUser()
const db = getFirestore()

// Dados da empresa
const empresa = ref(null)
const loading = ref(true)
const error = ref('')
const editando = ref(false)

// Formulário
const formEmpresa = ref({
  nome: '',
  descricao: '',
  endereco: {
    rua: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: 'Arroio do Sal',
    estado: 'RS',
    cep: '',
    referencia: '',
    contato: {
      nome: '',
      telefone: ''
    }
  },
  telefone: '',
  email: '',
  horarioAbertura: '',
  horarioFechamento: ''
})

async function carregarDadosEmpresa() {
  try {
    if (!userData.value?.empresaId) {
      throw new Error('Empresa não encontrada')
    }

    const empresaDoc = await getDoc(doc(db, 'empresas', userData.value.empresaId))
    if (!empresaDoc.exists()) {
      throw new Error('Empresa não encontrada')
    }

    const dados = empresaDoc.data()
    empresa.value = dados
    // Merge defensivo para garantir todos os campos
    formEmpresa.value = {
      nome: '',
      descricao: '',
      endereco: {
        rua: '',
        numero: '',
        complemento: '',
        bairro: '',
        cidade: 'Arroio do Sal',
        estado: 'RS',
        cep: '',
        referencia: '',
        contato: {
          nome: '',
          telefone: ''
        }
      },
      telefone: '',
      email: '',
      horarioAbertura: '',
      horarioFechamento: '',
      ...dados,
      endereco: {
        rua: '',
        numero: '',
        complemento: '',
        bairro: '',
        cidade: 'Arroio do Sal',
        estado: 'RS',
        cep: '',
        referencia: '',
        contato: {
          nome: '',
          telefone: ''
        },
        ...(dados.endereco || {})
      }
    }
  } catch (err) {
    console.error('Erro ao carregar dados da empresa:', err)
    error.value = 'Erro ao carregar dados da empresa'
  }
}

function iniciarEdicao() {
  editando.value = true
}

function cancelarEdicao() {
  formEmpresa.value = { ...empresa.value }
  editando.value = false
}

async function salvarPerfil() {
  try {
    if (!userData.value?.empresaId) {
      throw new Error('Empresa não encontrada')
    }

    await updateDoc(doc(db, 'empresas', userData.value.empresaId), formEmpresa.value)
    empresa.value = { ...formEmpresa.value }
    editando.value = false
  } catch (err) {
    console.error('Erro ao salvar dados:', err)
    error.value = 'Erro ao salvar dados'
  }
}

function logout() {
  signOut(auth)
  router.push('/login')
}

// Aguarda userData estar disponível antes de buscar dados
watch(
  () => userData.value,
  async (val) => {
    if (val && val.empresaId) {
      loading.value = true
      error.value = ''
      try {
        await carregarDadosEmpresa()
      } catch (err) {
        error.value = 'Erro ao carregar dados'
      } finally {
        loading.value = false
      }
    }
  },
  { immediate: true }
)
</script>

<style scoped>
.bg-gradient-to-b {
  min-height: 100vh;
}
.pt-8 {
  padding-top: 2rem;
}
</style>