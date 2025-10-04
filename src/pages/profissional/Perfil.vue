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
              <div>
                <label class="block text-sm font-medium text-gray-700">Balneário</label>
                <select v-model="formEmpresa.endereco.bairro" :disabled="!editando" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100">
                  <option disabled value="">Selecione o balneário</option>
                  <option>Rota do Sol</option>
                  <option>Sul Atlântida</option>
                  <option>Esmeralda</option>
                  <option>Pérola</option>
                  <option>Bom Jesus</option>
                  <option>Arroio Novo</option>
                  <option>Sol Nascente</option>
                  <option>Vô Dada</option>
                  <option>Sereia do Mar</option>
                  <option>Marambaia</option>
                  <option>Âncora</option>
                  <option>Belo Horizonte</option>
                  <option>Figueirinha</option>
                  <option>Vista Alegre</option>
                  <option>Jardim Raiante</option>
                  <option>Arroio do Sal Sul</option>
                  <option>Verde Mar</option>
                  <option>Magnus</option>
                  <option>Bismar Borges</option>
                  <option>Reserva dos Lagos</option>
                  <option>Malinsky</option>
                  <option>Quatro Lagos</option>
                  <option>Novo Arroio do Sal (Jovino)</option>
                  <option>Arroio do Sal Sede (Centro)</option>
                  <option>Areias Brancas</option>
                  <option>Camboim</option>
                  <option>Lagoa do Camboim</option>
                  <option>Parque Lagoa Itapeva</option>
                  <option>Condomínio Residencial Parque das Figueiras</option>
                  <option>São Jorge</option>
                  <option>São Paulo</option>
                  <option>São Pedro</option>
                  <option>Jardim Olívia</option>
                  <option>Alfa</option>
                  <option>Jardim Olívia Norte</option>
                  <option>Caramuru</option>
                  <option>Rondinha Vargas</option>
                  <option>Rondinha Ninow</option>
                  <option>Rondinha Nova</option>
                  <option>Rondinha Velha</option>
                  <option>Rondinha Plano B</option>
                  <option>Rondinha Maggi</option>
                  <option>Tupancy</option>
                  <option>Rondinha Mello</option>
                  <option>Balneário Atlântico</option>
                  <option>Pinus Park</option>
                  <option>Praia Azul</option>
                  <option>Cardoso</option>
                  <option>Randon</option>
                  <option>Caxias do Sul</option>
                  <option>Arroio Seco Sul</option>
                  <option>Arroio Seco</option>
                  <option>Colônia</option>
                  <option>Miramar</option>
                  <option>Mar del Plata</option>
                  <option>Serra Azul</option>
                  <option>Torres Sul</option>
                  <option>Praia Menina</option>
                </select>
              </div>
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
            <div v-for="(dias, nomeDia) in labels" :key="nomeDia" class="mb-4">
              <h4 class="font-bold">{{ dias.label }}</h4>
              <div class="grid grid-cols-3 gap-4">
                <div v-for="(periodo, nomePeriodo) in dias.periodos" :key="nomePeriodo">
                  <label class="block font-medium">{{ periodo }}</label>
                  <div class="flex items-center gap-2">
                    <input type="checkbox" v-model="horarios[nomeDia][nomePeriodo].aberto" :id="`${nomeDia}-${nomePeriodo}-aberto`" :disabled="!editando" />
                    <label :for="`${nomeDia}-${nomePeriodo}-aberto`">Aberto</label>
                  </div>
                  <div v-if="horarios[nomeDia][nomePeriodo].aberto" class="flex gap-2 mt-1">
                    <input type="time" v-model="horarios[nomeDia][nomePeriodo].inicio" :disabled="!editando" class="input" />
                    <span>às</span>
                    <input type="time" v-model="horarios[nomeDia][nomePeriodo].fim" :disabled="!editando" class="input" />
                  </div>
                </div>
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
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { doc, getDoc, getFirestore, updateDoc } from 'firebase/firestore'
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import HeaderProfissional from '../../components/HeaderProfissional.vue'
import { auth } from '../../services/firebase'
import { useUserStore } from '../../stores/user'

const router = useRouter()
const userStore = useUserStore()
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

const horarios = ref({
  semana: { manha: { aberto: false, inicio: '', fim: '' }, tarde: { aberto: false, inicio: '', fim: '' }, noite: { aberto: false, inicio: '', fim: '' } },
  sabado: { manha: { aberto: false, inicio: '', fim: '' }, tarde: { aberto: false, inicio: '', fim: '' }, noite: { aberto: false, inicio: '', fim: '' } },
  domingo: { manha: { aberto: false, inicio: '', fim: '' }, tarde: { aberto: false, inicio: '', fim: '' }, noite: { aberto: false, inicio: '', fim: '' } }
})
const labels = {
  semana: { label: 'Segunda a Sexta', periodos: { manha: 'Manhã', tarde: 'Tarde', noite: 'Noite' } },
  sabado: { label: 'Sábado', periodos: { manha: 'Manhã', tarde: 'Tarde', noite: 'Noite' } },
  domingo: { label: 'Domingo', periodos: { manha: 'Manhã', tarde: 'Tarde', noite: 'Noite' } }
}

async function carregarDadosEmpresa() {
  try {
    if (!userStore.userData?.empresaId) {
      throw new Error('Empresa não encontrada')
    }

    const empresaDoc = await getDoc(doc(db, 'empresas', userStore.userData.empresaId))
    if (!empresaDoc.exists()) {
      error.value = 'Empresa não encontrada. Você pode ter sido removido do sistema. Redirecionando para o cadastro...'
      empresa.value = null
      formEmpresa.value = {
        nome: '', descricao: '', endereco: { rua: '', numero: '', complemento: '', bairro: '', cidade: 'Arroio do Sal', estado: 'RS', cep: '', referencia: '', contato: { nome: '', telefone: '' } }, telefone: '', email: '', horarioAbertura: '', horarioFechamento: ''
      }
      setTimeout(() => {
        router.push('/cadastro')
      }, 4000)
      return
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
    // Preenche horários se existirem
    if (dados.horarios) {
      horarios.value = JSON.parse(JSON.stringify(dados.horarios))
    }
  } catch (err) {
    console.error('Erro ao carregar dados da empresa:', err)
    error.value = 'Erro ao carregar dados da empresa. Redirecionando para o cadastro...'
    setTimeout(() => {
      router.push('/cadastro')
    }, 4000)
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
    if (!userStore.userData?.empresaId) {
      throw new Error('Empresa não encontrada')
    }
    formEmpresa.value.horarios = horarios.value
    await updateDoc(doc(db, 'empresas', userStore.userData.empresaId), formEmpresa.value)
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
  () => userStore.userData,
  async (val) => {
    loading.value = true
    error.value = ''
    if (val && val.empresaId) {
      try {
        await carregarDadosEmpresa()
      } catch (err) {
        error.value = 'Erro ao carregar dados'
      } finally {
        loading.value = false
      }
    } else {
      // Se não tem empresaId, já trata como erro
      error.value = 'Empresa não encontrada. Verificando status do usuário...'
      loading.value = false
      setTimeout(async () => {
        // Verifica se o usuário existe na base de dados
        if (!userStore.user) {
          error.value = 'Usuário não autenticado. Redirecionando para login...'
          setTimeout(() => {
            router.push('/login')
          }, 2000)
          return
        }
        const userDocRef = doc(db, 'usuarios', userStore.user.uid)
        const userDocSnap = await getDoc(userDocRef)
        if (!userDocSnap.exists()) {
          error.value = 'Usuário removido do sistema. Redirecionando para login...'
          setTimeout(() => {
            router.push('/login')
          }, 2000)
        } else {
          router.push('/cadastro')
        }
      }, 4000)
    }
  },
  { immediate: true }
)

// Observa autenticação do usuário
onAuthStateChanged(auth, (user) => {
  if (!user) {
    router.push('/login')
  }
})
</script>

<style scoped>
.bg-gradient-to-b {
  min-height: 100vh;
}
.pt-8 {
  padding-top: 2rem;
}
</style>