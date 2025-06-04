<template>
  <HeaderProfissional :empresa="empresa" />
  <div class="min-h-screen bg-gradient-to-b from-blue-50 to-white pt-8 flex flex-col items-center">
    <div class="w-full max-w-3xl space-y-8">
      <!-- Cabeçalho da Página -->
      <div class="flex justify-between items-center">
        <h2 class="text-2xl font-bold text-blue-800">Minhas Promoções</h2>
        <button
          @click="mostrarModalNovaPromocao = true"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <span>➕</span>
          <span>Nova Promoção</span>
        </button>
      </div>

      <!-- Lista de Promoções -->
      <div class="bg-white p-6 rounded-xl shadow">
        <div v-if="loading" class="text-center py-4">
          <p class="text-gray-600">Carregando promoções...</p>
        </div>
        <div v-else-if="error" class="text-center py-4">
          <p class="text-red-600">{{ error }}</p>
        </div>
        <div v-else-if="promocoes.length === 0" class="text-gray-500 text-center">
          Nenhuma promoção cadastrada.
        </div>
        <div v-else class="space-y-4">
          <div v-for="promocao in promocoes" :key="promocao.id" class="border-b pb-4 last:border-b-0 last:pb-0">
            <div class="flex justify-between items-start">
              <div>
                <h3 class="text-lg font-semibold text-blue-800">{{ promocao.titulo }}</h3>
                <p class="text-gray-600 mt-1">{{ promocao.descricao }}</p>
                <div class="mt-2 flex items-center space-x-4">
                  <span class="text-green-600 font-semibold">{{ promocao.desconto }}% OFF</span>
                  <span class="text-gray-500">Válido até {{ formatDate(promocao.validade) }}</span>
                </div>
                <div class="mt-2">
                  <span class="text-sm text-gray-500">Serviços incluídos:</span>
                  <div class="flex flex-wrap gap-2 mt-1">
                    <span
                      v-for="servico in promocao.servicos"
                      :key="servico.id"
                      class="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      {{ servico.nome }}
                    </span>
                  </div>
                </div>
              </div>
              <div class="flex space-x-2">
                <button
                  @click="editarPromocao(promocao)"
                  class="text-blue-600 hover:text-blue-800"
                >
                  ✏️
                </button>
                <button
                  @click="excluirPromocao(promocao.id)"
                  class="text-red-600 hover:text-red-800"
                >
                  🗑️
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal de Nova Promoção -->
  <div v-if="mostrarModalNovaPromocao" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
    <div class="bg-white rounded-xl p-6 w-full max-w-md">
      <h3 class="text-xl font-bold text-blue-800 mb-4">{{ promocaoEditando ? 'Editar Promoção' : 'Nova Promoção' }}</h3>

      <form @submit.prevent="salvarPromocao" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700">Título da Promoção</label>
          <input
            v-model="formPromocao.titulo"
            type="text"
            required
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Descrição</label>
          <textarea
            v-model="formPromocao.descricao"
            required
            rows="3"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          ></textarea>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Desconto (%)</label>
          <input
            v-model="formPromocao.desconto"
            type="number"
            min="1"
            max="99"
            required
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Data de Validade</label>
          <input
            v-model="formPromocao.validade"
            type="date"
            required
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Serviços Incluídos</label>
          <div class="space-y-2">
            <div v-for="servico in servicos" :key="servico.id" class="flex items-center">
              <input
                type="checkbox"
                :value="servico"
                v-model="formPromocao.servicos"
                class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label class="ml-2 text-sm text-gray-700">
                {{ servico.nome }} - R$ {{ servico.preco.toFixed(2) }}
              </label>
            </div>
          </div>
        </div>

        <div class="flex justify-end space-x-3 mt-6">
          <button
            type="button"
            @click="mostrarModalNovaPromocao = false"
            class="px-4 py-2 text-gray-700 hover:text-gray-900"
          >
            Cancelar
          </button>
          <button
            type="submit"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {{ promocaoEditando ? 'Salvar' : 'Criar' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { signOut } from 'firebase/auth'
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, getFirestore, orderBy, query, serverTimestamp, updateDoc, where } from 'firebase/firestore'
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import HeaderProfissional from '../../components/HeaderProfissional.vue'
import { auth } from '../../services/firebase'
import useAuthUser from '../../useAuthUser'
import { formatDate } from '../../utils'

const router = useRouter()
const { user, userData } = useAuthUser()
const db = getFirestore()

// Dados da empresa
const empresa = ref(null)

// Promoções e Serviços
const promocoes = ref([])
const servicos = ref([])
const loading = ref(true)
const error = ref('')

// Modal e Formulário
const mostrarModalNovaPromocao = ref(false)
const promocaoEditando = ref(null)
const formPromocao = ref({
  titulo: '',
  descricao: '',
  desconto: '',
  validade: '',
  servicos: []
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

    empresa.value = empresaDoc.data()
  } catch (err) {
    console.error('Erro ao carregar dados da empresa:', err)
    error.value = 'Erro ao carregar dados da empresa'
  }
}

async function carregarServicos() {
  try {
    if (!userData.value?.empresaId) {
      throw new Error('Empresa não encontrada')
    }
    const servicosRef = collection(db, 'servicos')
    const q = query(servicosRef, where('empresaId', '==', userData.value.empresaId), orderBy('nome'))
    const querySnapshot = await getDocs(q)
    servicos.value = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  } catch (err) {
    if (err.message !== 'Empresa não encontrada') {
      error.value = 'Erro ao carregar serviços'
    }
  }
}

async function carregarPromocoes() {
  try {
    if (!userData.value?.empresaId) {
      throw new Error('Empresa não encontrada')
    }
    const promocoesRef = collection(db, 'promocoes')
    const q = query(promocoesRef, where('empresaId', '==', userData.value.empresaId), orderBy('validade', 'desc'))
    const querySnapshot = await getDocs(q)
    promocoes.value = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  } catch (err) {
    if (err.message !== 'Empresa não encontrada') {
      error.value = 'Erro ao carregar promoções'
    }
  }
}

function editarPromocao(promocao) {
  promocaoEditando.value = promocao
  formPromocao.value = {
    ...promocao,
    servicos: servicos.value.filter(s => promocao.servicos?.some(ps => ps.id === s.id))
  }
  mostrarModalNovaPromocao.value = true
}

async function excluirPromocao(id) {
  if (confirm('Tem certeza que deseja excluir esta promoção?')) {
    try {
      await deleteDoc(doc(db, 'promocoes', id))
      await carregarPromocoes()
    } catch (err) {
      console.error('Erro ao excluir promoção:', err)
      error.value = 'Erro ao excluir promoção'
    }
  }
}

async function salvarPromocao() {
  try {
    if (!userData.value?.empresaId) {
      throw new Error('Empresa não encontrada')
    }
    const dados = {
      titulo: formPromocao.value.titulo,
      descricao: formPromocao.value.descricao,
      desconto: parseInt(formPromocao.value.desconto),
      validade: formPromocao.value.validade,
      empresaId: userData.value.empresaId,
      ativo: true,
      criadoEm: serverTimestamp(),
      servicos: formPromocao.value.servicos.map(s => ({ id: s.id, nome: s.nome }))
    }
    console.log('Dados enviados para o Firestore (promoção):', dados)
    if (promocaoEditando.value) {
      await updateDoc(doc(db, 'promocoes', promocaoEditando.value.id), dados)
    } else {
      await addDoc(collection(db, 'promocoes'), dados)
    }
    mostrarModalNovaPromocao.value = false
    promocaoEditando.value = null
    formPromocao.value = {
      titulo: '',
      descricao: '',
      desconto: '',
      validade: '',
      servicos: []
    }
    await carregarPromocoes()
  } catch (err) {
    console.error('Erro ao salvar promoção:', err)
    error.value = 'Erro ao salvar promoção'
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
        await Promise.all([
          carregarDadosEmpresa(),
          carregarServicos(),
          carregarPromocoes()
        ])
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