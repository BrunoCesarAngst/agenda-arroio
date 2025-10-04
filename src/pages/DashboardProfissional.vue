<template>
  <HeaderProfissional
    :empresa="empresa"
    @search="handleSearch"
    @notifications="handleNotifications"
  />
  <div class="min-h-screen bg-gradient-to-b from-blue-50 to-white pt-8 flex flex-col items-center">
    <div class="w-full max-w-3xl space-y-8">
      <!-- Agendamentos Recebidos -->
      <div class="bg-white p-6 rounded-xl shadow">
        <h3 class="text-lg font-bold mb-4 text-blue-700">Agendamentos Recebidos</h3>
        <div v-if="loading" class="text-center py-4">
          <p class="text-gray-600">Carregando agendamentos...</p>
        </div>
        <div v-else-if="error" class="text-center py-4">
          <p class="text-red-600">{{ error }}</p>
        </div>
        <div v-else-if="agendamentos.length === 0" class="text-blue-700 text-center py-8">
          <p class="text-lg font-semibold">Nenhum agendamento encontrado.</p>
          <p class="text-gray-500 mt-2">Quando um cliente realizar um agendamento, ele aparecerá aqui!</p>
        </div>
        <div v-else class="space-y-3">
          <div v-for="ag in agendamentos" :key="ag.id" class="border-b pb-2 last:border-b-0 last:pb-0 flex justify-between items-center">
            <div>
              <p class="font-semibold">{{ ag.servico }}</p>
              <p class="text-sm text-gray-600">Cliente: {{ ag.cliente }}</p>
              <p class="text-sm text-gray-600">Data: {{ formatDate(ag.data) }} - {{ ag.hora }}</p>
              <p class="text-xs text-gray-500">Status: <span :class="statusClass(ag.status)">{{ ag.status }}</span></p>
            </div>
            <div class="flex space-x-2">
              <button v-if="ag.status === 'pendente'" class="text-green-600 hover:underline text-xs" @click="confirmarAgendamento(ag.id)">
                Confirmar
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Gestão de Serviços -->
      <div class="bg-white p-6 rounded-xl shadow">
        <h3 class="text-lg font-bold mb-4 text-blue-700">Serviços Oferecidos</h3>
        <div v-if="servicos.length === 0" class="text-gray-500 text-center">Nenhum serviço cadastrado.</div>
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div v-for="servico in servicos" :key="servico.id" class="bg-blue-50 rounded-lg p-3 flex flex-col gap-1 border border-blue-100">
            <h4 class="font-bold text-blue-800">{{ servico.nome }}</h4>
            <p class="text-gray-700 text-sm">{{ servico.descricao }}</p>
            <span class="text-2xl">{{ servico.emoji }}</span>
          </div>
        </div>
        <div class="text-center mt-4">
          <button class="text-blue-700 hover:underline font-semibold" @click="adicionarServico">Adicionar novo serviço</button>
        </div>
      </div>

      <!-- Promoções da Empresa -->
      <div class="bg-white p-6 rounded-xl shadow">
        <h3 class="text-lg font-bold mb-4 text-blue-700">Promoções Ativas</h3>
        <div v-if="promocoes.length === 0" class="text-gray-500 text-center">Nenhuma promoção ativa.</div>
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div v-for="promo in promocoes" :key="promo.id" class="bg-green-50 rounded-lg p-3 flex flex-col gap-1 border border-green-100">
            <h4 class="font-bold text-green-800">{{ promo.titulo }}</h4>
            <p class="text-gray-700 text-sm">{{ promo.descricao }}</p>
            <span class="bg-green-200 text-green-800 px-2 py-1 rounded text-xs font-bold self-start">Válido até {{ formatDate(promo.validade) }}</span>
          </div>
        </div>
        <div class="text-center mt-4">
          <button class="text-green-700 hover:underline font-semibold" @click="adicionarPromocao">Adicionar promoção</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { collection, doc, getDoc, getDocs, getFirestore, orderBy, query, setDoc, updateDoc, where } from 'firebase/firestore'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import HeaderProfissional from '../components/HeaderProfissional.vue'
import { useUserStore } from '../stores/user'
import { formatDate } from '../utils'

const router = useRouter()
const userStore = useUserStore()
const db = getFirestore()

// Dados da empresa
const empresa = ref(null)

// Agendamentos recebidos
const agendamentos = ref([])

// Serviços oferecidos
const servicos = ref([])

// Promoções
const promocoes = ref([])

// Loading e erro
const loading = ref(true)
const error = ref('')

const mostrarModalCliente = ref(false)

async function criarEmpresaBasica() {
  try {
    const empresaData = {
      nome: userStore.userData?.nome || 'Minha Empresa',
      descricao: 'Descrição da empresa',
      endereco: userStore.userData?.endereco || {
        rua: '',
        numero: '',
        complemento: '',
        bairro: '',
        cidade: 'Arroio do Sal',
        estado: 'RS',
        cep: '95585-000',
        referencia: '',
        contato: { nome: '', telefone: '' }
      },
      telefone: userStore.userData?.telefone || '',
      email: userStore.userData?.email || '',
      ativo: true,
      criadoEm: new Date()
    }

    // Cria a empresa no Firestore
    const empresaRef = doc(collection(db, 'empresas'))
    await setDoc(empresaRef, empresaData)

    // Atualiza o usuário com o empresaId
    await updateDoc(doc(db, 'usuarios', userStore.user.uid), {
      empresaId: empresaRef.id
    })

    // Atualiza a store
    await userStore.refreshUserData()

    empresa.value = empresaData
    console.log('Empresa criada com sucesso:', empresaRef.id)
  } catch (err) {
    console.error('Erro ao criar empresa:', err)
    error.value = 'Erro ao criar empresa'
  }
}

async function carregarDadosEmpresa() {
  try {
    if (!userStore.userData?.empresaId) {
      console.log('Usuário não tem empresaId, criando empresa...')
      // Se não tem empresaId, cria uma empresa básica
      await criarEmpresaBasica()
      return
    }
    const empresaDoc = await getDoc(doc(db, 'empresas', userStore.userData.empresaId))
    if (!empresaDoc.exists()) {
      throw new Error('Empresa não encontrada')
    }
    empresa.value = empresaDoc.data()
  } catch (err) {
    console.error('Erro ao carregar dados da empresa:', err)
    error.value = 'Erro ao carregar dados da empresa'
  }
}

async function carregarAgendamentos() {
  try {
    if (!userStore.userData?.empresaId) {
      console.log('Sem empresaId, pulando carregamento de agendamentos')
      return
    }
    const agendamentosRef = collection(db, 'agendamentos')
    const q = query(
      agendamentosRef,
      where('empresaId', '==', userStore.userData.empresaId),
      orderBy('data', 'desc'),
      orderBy('hora', 'desc')
    )
    const querySnapshot = await getDocs(q)
    const agendamentosData = []
    for (const docSnap of querySnapshot.docs) {
      const agendamento = docSnap.data()
      // Busca dados do serviço
      let servicoNome = 'Serviço não encontrado'
      try {
        const servicoDoc = await getDoc(doc(db, 'servicos', agendamento.servicoId))
        if (servicoDoc.exists()) servicoNome = servicoDoc.data().nome
      } catch {}
      // Busca dados do cliente
      let clienteNome = 'Cliente não encontrado'
      try {
        if (agendamento.clienteTipo === 'externo') {
          const clienteDoc = await getDoc(doc(db, 'clientes_externos', agendamento.clienteId))
          if (clienteDoc.exists()) clienteNome = clienteDoc.data().nome
        } else {
          const clienteDoc = await getDoc(doc(db, 'usuarios', agendamento.clienteId))
          if (clienteDoc.exists()) clienteNome = clienteDoc.data().nome
        }
      } catch {}
      agendamentosData.push({
        id: docSnap.id,
        servico: servicoNome,
        cliente: clienteNome,
        data: agendamento.data,
        hora: agendamento.hora,
        status: agendamento.status
      })
    }
    agendamentos.value = agendamentosData
  } catch (err) {
    console.error('Erro ao carregar agendamentos:', err)
    error.value = 'Erro ao carregar agendamentos'
  }
}

async function carregarServicos() {
  try {
    if (!userStore.userData?.empresaId) {
      console.log('Sem empresaId, pulando carregamento de serviços')
      return
    }
    const servicosRef = collection(db, 'servicos')
    const q = query(servicosRef, where('empresaId', '==', userStore.userData.empresaId), orderBy('nome'))
    const querySnapshot = await getDocs(q)
    servicos.value = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  } catch (err) {
    console.error('Erro ao carregar serviços:', err)
    error.value = 'Erro ao carregar serviços'
  }
}

async function carregarPromocoes() {
  try {
    if (!userStore.userData?.empresaId) {
      console.log('Sem empresaId, pulando carregamento de promoções')
      return
    }
    const promocoesRef = collection(db, 'promocoes')
    const q = query(promocoesRef, where('empresaId', '==', userStore.userData.empresaId), orderBy('validade', 'desc'))
    const querySnapshot = await getDocs(q)
    promocoes.value = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  } catch (err) {
    console.error('Erro ao carregar promoções:', err)
    error.value = 'Erro ao carregar promoções'
  }
}

function statusClass(status) {
  switch (status) {
    case 'confirmado': return 'text-green-600 font-bold'
    case 'pendente': return 'text-yellow-600 font-bold'
    case 'cancelado': return 'text-red-600 font-bold'
    default: return ''
  }
}

function confirmarAgendamento(id) {
  alert('Funcionalidade de confirmação em breve!')
}

function adicionarServico() {
  router.push('/servicos')
}

function adicionarPromocao() {
  router.push('/promocoes')
}

function handleSearch(query) {
  // Implementar lógica de busca
  console.log('Busca:', query)
}

function handleNotifications() {
  // Implementar lógica de notificações
  console.log('Notificações clicadas')
}

onMounted(async () => {
  try {
    loading.value = true
    error.value = ''
    await Promise.all([
      carregarDadosEmpresa(),
      carregarAgendamentos(),
      carregarServicos(),
      carregarPromocoes()
    ])
  } catch (err) {
    console.error('Erro ao carregar dados:', err)
    error.value = 'Erro ao carregar dados'
  } finally {
    loading.value = false
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