<template>
  <HeaderProfissional :empresa="empresa" />
  <div class="min-h-screen bg-gradient-to-b from-blue-50 to-white pt-8 flex flex-col items-center">
    <div class="w-full max-w-3xl space-y-8">
      <!-- Botão para adicionar cliente externo -->
      <div class="flex justify-end mb-4">
        <button
          @click="mostrarModalCliente = true"
          class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          + Adicionar novo cliente
        </button>
      </div>
      <!-- Botão para novo agendamento -->
      <div class="flex justify-end mb-4">
        <button
          @click="abrirModalAgendamento"
          class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
        >
          + Novo Agendamento
        </button>
      </div>
      <!-- Modal de cadastro de cliente externo -->
      <div v-if="mostrarModalCliente" class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
        <div class="bg-white rounded-xl p-6 w-full max-w-md relative">
          <button
            @click="mostrarModalCliente = false"
            class="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-xl"
            aria-label="Fechar"
          >×</button>
          <h2 class="text-lg font-bold mb-4 text-blue-800">Adicionar Cliente Externo</h2>
          <AdicionarClienteExterno @close="mostrarModalCliente = false" />
        </div>
      </div>
      <!-- Modal de novo agendamento -->
      <div v-if="mostrarModalAgendamento" class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
        <div class="bg-white rounded-xl p-6 w-full max-w-md relative">
          <button @click="mostrarModalAgendamento = false" class="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-xl" aria-label="Fechar">×</button>
          <h2 class="text-lg font-bold mb-4 text-blue-800">Novo Agendamento</h2>
          <form @submit.prevent="criarAgendamento" class="space-y-4">
            <!-- Feedbacks para clientes -->
            <div v-if="carregandoClientes" class="text-gray-500 text-center">Carregando clientes...</div>
            <div v-if="erroClientes" class="text-red-500 text-center">{{ erroClientes }}</div>
            <div v-if="!carregandoClientes && clientes.length === 0" class="text-red-500 text-center">Nenhum cliente encontrado para esta empresa.</div>
            <div>
              <label class="block text-sm">Cliente</label>
              <select v-model="selectedCliente" required class="input">
                <option v-for="c in clientes" :key="c.id + c.tipo" :value="c">{{ c.nome }} ({{ c.tipo === 'usuario' ? 'Interno' : 'Externo' }})</option>
              </select>
            </div>
            <!-- Feedbacks para serviços -->
            <div v-if="carregandoServicos" class="text-gray-500 text-center">Carregando serviços...</div>
            <div v-if="erroServicos" class="text-red-500 text-center">{{ erroServicos }}</div>
            <div v-if="!carregandoServicos && servicos.length === 0" class="text-red-500 text-center">Nenhum serviço cadastrado para esta empresa.</div>
            <div>
              <label class="block text-sm">Serviço</label>
              <select v-model="selectedServico" required class="input">
                <option v-for="s in servicos" :key="s.id" :value="s">{{ s.nome }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm">Data</label>
              <input v-model="dataSelecionada" type="date" required class="input" />
            </div>
            <div>
              <label class="block text-sm">Hora</label>
              <input v-model="horaSelecionada" type="time" required class="input" />
            </div>
            <p v-if="agendamentoErro" class="text-red-500 text-sm">{{ agendamentoErro }}</p>
            <p v-if="sucessoAgendamento" class="text-green-600 text-center">{{ sucessoAgendamento }}</p>
            <button class="btn-primary w-full">Criar Agendamento</button>
          </form>
        </div>
      </div>
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
              <button v-if="ag.status === 'pendente'" class="text-red-600 hover:underline text-xs" @click="cancelarAgendamento(ag.id)">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { signOut } from 'firebase/auth'
import { addDoc, collection, doc, getDoc, getDocs, getFirestore, orderBy, query, serverTimestamp, updateDoc, where } from 'firebase/firestore'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import AdicionarClienteExterno from '../../components/AdicionarClienteExterno.vue'
import HeaderProfissional from '../../components/HeaderProfissional.vue'
import { auth } from '../../services/firebase'
import useAuthUser from '../../useAuthUser'
import { formatDate } from '../../utils'

const router = useRouter()
const { user, userData } = useAuthUser()
const db = getFirestore()

// Dados da empresa
const empresa = ref(null)

// Agendamentos
const agendamentos = ref([])
const loading = ref(true)
const error = ref('')

const mostrarModalCliente = ref(false)
const mostrarModalAgendamento = ref(false)
const clientes = ref([])
const servicos = ref([])
const selectedCliente = ref(null)
const selectedServico = ref(null)
const dataSelecionada = ref('')
const horaSelecionada = ref('')
const agendamentoErro = ref('')
const carregandoClientes = ref(false)
const erroClientes = ref('')
const carregandoServicos = ref(false)
const erroServicos = ref('')
const sucessoAgendamento = ref('')

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

async function carregarAgendamentos() {
  try {
    console.log('userData:', userData.value)
    if (!userData.value?.empresaId) {
      throw new Error('Empresa não encontrada')
    }

    // Busca agendamentos da empresa
    const agendamentosRef = collection(db, 'agendamentos')
    const q = query(
      agendamentosRef,
      where('empresaId', '==', userData.value.empresaId),
      orderBy('data', 'desc'),
      orderBy('hora', 'desc')
    )

    const querySnapshot = await getDocs(q)
    console.log('querySnapshot:', querySnapshot.docs)
    const agendamentosData = []

    // Processa cada agendamento
    for (const docSnap of querySnapshot.docs) {
      const agendamento = docSnap.data();
      console.log('Processando agendamento:', docSnap.id, agendamento);

      // Busca dados do serviço
      let servicoNome = 'Serviço não encontrado';
      try {
        const servicoDoc = await getDoc(doc(db, 'servicos', agendamento.servicoId));
        if (servicoDoc.exists()) servicoNome = servicoDoc.data().nome;
        else console.warn('Serviço não encontrado para ID:', agendamento.servicoId);
      } catch (e) {
        console.error('Erro ao buscar serviço:', agendamento.servicoId, e);
      }

      // Busca dados do cliente
      let clienteNome = 'Cliente não encontrado';
      try {
        if (agendamento.clienteTipo === 'externo') {
          const clienteDoc = await getDoc(doc(db, 'clientes_externos', agendamento.clienteId));
          if (clienteDoc.exists()) clienteNome = clienteDoc.data().nome;
          else console.warn('Cliente externo não encontrado para ID:', agendamento.clienteId);
        } else {
          const clienteDoc = await getDoc(doc(db, 'usuarios', agendamento.clienteId));
          if (clienteDoc.exists()) clienteNome = clienteDoc.data().nome;
          else console.warn('Cliente interno não encontrado para ID:', agendamento.clienteId);
        }
      } catch (e) {
        console.error('Erro ao buscar cliente:', agendamento.clienteId, e);
      }

      agendamentosData.push({
        id: docSnap.id,
        servico: servicoNome,
        cliente: clienteNome,
        data: agendamento.data,
        hora: agendamento.hora,
        status: agendamento.status
      });
    }

    agendamentos.value = agendamentosData
  } catch (err) {
    console.error('Erro ao carregar agendamentos:', err)
    error.value = 'Erro ao carregar agendamentos: ' + (err.message || err)
  }
}

async function confirmarAgendamento(id) {
  try {
    const agendamentoRef = doc(db, 'agendamentos', id)
    await updateDoc(agendamentoRef, {
      status: 'confirmado'
    })

    // Atualiza o status localmente
    const index = agendamentos.value.findIndex(a => a.id === id)
    if (index !== -1) {
      agendamentos.value[index].status = 'confirmado'
    }
  } catch (err) {
    console.error('Erro ao confirmar agendamento:', err)
    error.value = 'Erro ao confirmar agendamento'
  }
}

async function cancelarAgendamento(id) {
  try {
    const agendamentoRef = doc(db, 'agendamentos', id)
    await updateDoc(agendamentoRef, {
      status: 'cancelado'
    })

    // Atualiza o status localmente
    const index = agendamentos.value.findIndex(a => a.id === id)
    if (index !== -1) {
      agendamentos.value[index].status = 'cancelado'
    }
  } catch (err) {
    console.error('Erro ao cancelar agendamento:', err)
    error.value = 'Erro ao cancelar agendamento'
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

function logout() {
  signOut(auth)
  router.push('/login')
}

// Buscar clientes internos e externos
async function carregarClientes() {
  carregandoClientes.value = true
  erroClientes.value = ''
  clientes.value = []
  try {
    // Clientes internos
    const usuariosSnap = await getDocs(query(collection(db, 'usuarios'), where('tipo', '==', 'cliente')))
    usuariosSnap.forEach(doc => {
      clientes.value.push({ id: doc.id, nome: doc.data().nome, tipo: 'usuario' })
    })
    // Clientes externos da empresa
    if (userData.value?.empresaId) {
      const externosSnap = await getDocs(query(collection(db, 'clientes_externos'), where('empresaId', '==', userData.value.empresaId)))
      externosSnap.forEach(doc => {
        clientes.value.push({ id: doc.id, nome: doc.data().nome, tipo: 'externo' })
      })
    }
  } catch (e) {
    erroClientes.value = 'Erro ao buscar clientes: ' + (e.message || e)
  } finally {
    carregandoClientes.value = false
  }
}

// Buscar serviços da empresa
async function carregarServicosAgendamento() {
  carregandoServicos.value = true
  erroServicos.value = ''
  servicos.value = []
  try {
    if (userData.value?.empresaId) {
      const servicosSnap = await getDocs(query(collection(db, 'servicos'), where('empresaId', '==', userData.value.empresaId)))
      servicosSnap.forEach(doc => {
        servicos.value.push({ id: doc.id, nome: doc.data().nome })
      })
    }
  } catch (e) {
    erroServicos.value = 'Erro ao buscar serviços: ' + (e.message || e)
  } finally {
    carregandoServicos.value = false
  }
}

function abrirModalAgendamento() {
  agendamentoErro.value = ''
  sucessoAgendamento.value = ''
  selectedCliente.value = null
  selectedServico.value = null
  dataSelecionada.value = ''
  horaSelecionada.value = ''
  mostrarModalAgendamento.value = true
  carregarClientes()
  carregarServicosAgendamento()
}

async function criarAgendamento() {
  agendamentoErro.value = ''
  sucessoAgendamento.value = ''
  if (!selectedCliente.value || !selectedServico.value || !dataSelecionada.value || !horaSelecionada.value) {
    agendamentoErro.value = 'Preencha todos os campos.'
    return
  }
  try {
    const novoAgendamento = {
      clienteId: selectedCliente.value.id,
      clienteTipo: selectedCliente.value.tipo,
      empresaId: userData.value.empresaId,
      profissionalId: user.value.uid,
      servicoId: selectedServico.value.id,
      data: dataSelecionada.value,
      hora: horaSelecionada.value,
      status: 'pendente',
      criadoEm: serverTimestamp()
    }
    await addDoc(collection(db, 'agendamentos'), novoAgendamento)
    sucessoAgendamento.value = 'Agendamento criado com sucesso!'
    mostrarModalAgendamento.value = false
    await carregarAgendamentos()
  } catch (e) {
    agendamentoErro.value = 'Erro ao criar agendamento: ' + (e.message || e)
  }
}

onMounted(async () => {
  if (userData.value && userData.value.empresaId) {
    loading.value = true
    error.value = ''
    try {
      await Promise.all([
        carregarDadosEmpresa(),
        carregarAgendamentos()
      ])
    } catch (err) {
      console.error('Erro ao carregar dados:', err)
      error.value = 'Erro ao carregar dados'
    } finally {
      loading.value = false
    }
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