<template>
  <div class="max-w-md mx-auto mt-12 bg-white p-8 rounded-xl shadow space-y-6">
    <h2 class="text-xl font-bold text-center">Complete seu cadastro</h2>

    <!-- Indicador de carregamento -->
    <div v-if="userStore.loading" class="text-center py-4">
      <p class="text-gray-600">Carregando dados do usuário...</p>
    </div>


    <form v-else @submit.prevent="salvar">
      <div class="space-y-3">
        <input v-model="nome" type="text" placeholder="Seu nome completo" required class="input" />
        <input v-model="email" type="email" placeholder="E-mail" required class="input" />
        <input v-model="telefone" type="tel" placeholder="Telefone com DDD" required class="input" />

        <div class="flex gap-4 justify-center my-2">
          <label>
            <input type="radio" value="cliente" v-model="tipo" /> Sou Cliente
          </label>
          <label>
            <input type="radio" value="profissional" v-model="tipo" /> Sou Prestador/Empresa
          </label>
        </div>

        <!-- Campos extras para prestador -->
        <template v-if="tipo === 'profissional'">
          <input v-model="empresa.nome" type="text" placeholder="Nome da empresa" required class="input" />
          <input v-model="empresa.descricao" type="text" placeholder="Descrição da empresa" required class="input" />
        </template>

        <!-- Endereço (comum para ambos) -->
          <div><label>Rua</label><input v-model="endereco.rua" required class="input" /></div>
          <div><label>Número</label><input v-model="endereco.numero" required class="input" /></div>
        <div>
          <label>Balneário</label>
          <select v-model="endereco.bairro" required class="input">
            <option disabled value="">Selecione o balneário</option>
            <option>Alfa</option>
            <option>Âncora</option>
            <option>Areias Brancas</option>
            <option>Arroio do Sal Sede (Centro)</option>
            <option>Arroio do Sal Sul</option>
            <option>Arroio Novo</option>
            <option>Arroio Seco</option>
            <option>Arroio Seco Sul</option>
            <option>Balneário Atlântico</option>
            <option>Belo Horizonte</option>
            <option>Bismar Borges</option>
            <option>Bom Jesus</option>
            <option>Camboim</option>
            <option>Cardoso</option>
            <option>Caramuru</option>
            <option>Caxias do Sul</option>
            <option>Colônia</option>
            <option>Condomínio Residencial Parque das Figueiras</option>
            <option>Esmeralda</option>
            <option>Figueirinha</option>
            <option>Jardim Olívia</option>
            <option>Jardim Olívia Norte</option>
            <option>Jardim Raiante</option>
            <option>Lagoa do Camboim</option>
            <option>Magnus</option>
            <option>Malinsky</option>
            <option>Mar del Plata</option>
            <option>Marambaia</option>
            <option>Miramar</option>
            <option>Novo Arroio do Sal (Jovino)</option>
            <option>Parque Lagoa Itapeva</option>
            <option>Pérola</option>
            <option>Pinus Park</option>
            <option>Praia Azul</option>
            <option>Praia Menina</option>
            <option>Quatro Lagos</option>
            <option>Randon</option>
            <option>Reserva dos Lagos</option>
            <option>Rondinha Maggi</option>
            <option>Rondinha Mello</option>
            <option>Rondinha Ninow</option>
            <option>Rondinha Nova</option>
            <option>Rondinha Plano B</option>
            <option>Rondinha Vargas</option>
            <option>Rondinha Velha</option>
            <option>Rota do Sol</option>
            <option>São Jorge</option>
            <option>São Paulo</option>
            <option>São Pedro</option>
            <option>Serra Azul</option>
            <option>Sereia do Mar</option>
            <option>Sol Nascente</option>
            <option>Sul Atlântida</option>
            <option>Torres Sul</option>
            <option>Tupancy</option>
            <option>Verde Mar</option>
            <option>Vista Alegre</option>
            <option>Vô Dada</option>
          </select>
        </div>
          <div><label>Complemento</label><input v-model="endereco.complemento" class="input" /></div>
          <div><label>Referência</label><input v-model="endereco.referencia" class="input" /></div>
        <div><label>CEP</label><input v-model="endereco.cep" class="input" value="95585-000" readonly /></div>
          <div><label>Cidade</label><input v-model="endereco.cidade" required class="input" value="Arroio do Sal" readonly /></div>
          <div><label>Estado</label><input v-model="endereco.estado" required class="input" value="RS" readonly /></div>
          <div><label>Nome do contato</label><input v-model="endereco.contato.nome" class="input" /></div>
          <div><label>Telefone do contato</label><input v-model="endereco.contato.telefone" class="input" /></div>

        <button :disabled="salvando" type="submit" class="bg-blue-600 w-full py-2 text-white rounded font-bold hover:bg-blue-700">
          {{ salvando ? 'Salvando...' : 'Salvar' }}
        </button>
        <p v-if="erro" class="text-red-600 text-center">{{ erro }}</p>
      </div>
    </form>
  </div>
</template>

<script setup>
import { doc, serverTimestamp, setDoc } from 'firebase/firestore'
import { onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { db } from '../services/firebase'
import { useUserStore } from '../stores/user'
import { verifyUserAuth, waitForUserData } from '../utils/authUtils'

const router = useRouter()
const userStore = useUserStore()

const nome = ref('')
const email = ref('')
const foto = ref('')
const telefone = ref('')
const tipo = ref('cliente')
const empresa = ref({ nome: '', descricao: '' })
const endereco = ref({
  rua: '',
  numero: '',
  complemento: '',
  bairro: '',
  cidade: 'Arroio do Sal',
  estado: 'RS',
  cep: '95585-000',
  referencia: '',
  contato: { nome: '', telefone: '' }
})
const erro = ref('')
const salvando = ref(false)

// Inicializa a store quando o componente monta
onMounted(async () => {
  if (userStore.loading || !userStore.user) {
    await userStore.init()
  }
})

// Aguarda o carregamento dos dados do usuário
watch([() => userStore.user, () => userStore.userData, () => userStore.loading], async ([firebaseUser, data, isLoading]) => {
  if (!isLoading && firebaseUser) {
    // Preenche os campos com dados do Firebase Auth
    nome.value = firebaseUser.displayName || data?.nome || ''
    email.value = firebaseUser.email || data?.email || ''
    foto.value = firebaseUser.photoURL || data?.foto || ''

    // Tenta pegar telefone do profile (Google pode trazer em alguns casos)
    if (firebaseUser.phoneNumber) {
      telefone.value = firebaseUser.phoneNumber
    } else if (data?.telefone) {
      telefone.value = data.telefone
    }

    // Tenta pegar telefone de claims customizadas (caso exista)
    try {
      const tokenResult = await firebaseUser.getIdTokenResult()
      if (tokenResult.claims && tokenResult.claims.phone_number) {
        telefone.value = tokenResult.claims.phone_number
      }
    } catch (e) {
      // Ignora se não conseguir pegar claims
    }
  }
}, { immediate: true })

async function salvar() {
  erro.value = ''
  salvando.value = true

  try {
    // Aguarda o carregamento dos dados com timeout
    const dataLoaded = await waitForUserData(() => !userStore.loading, 10000)
    if (!dataLoaded) {
      throw new Error('Timeout aguardando carregamento dos dados do usuário.')
    }

    if (!userStore.user) {
      erro.value = 'Usuário não autenticado! Faça login novamente.'
      setTimeout(() => {
        router.push('/login')
      }, 3000)
      return
    }

    // Verifica se o token ainda é válido usando função utilitária
    const isAuthValid = await verifyUserAuth(userStore.user)
    if (!isAuthValid) {
      throw new Error('Sessão expirada. Faça login novamente.')
    }

    const usuarioData = {
      nome: nome.value,
      email: email.value,
      foto: foto.value,
      telefone: telefone.value,
      tipo: tipo.value,
      ativo: true,
      criadoEm: serverTimestamp(),
      endereco: endereco.value
    }

    if (tipo.value === 'profissional') {
      usuarioData.empresa = empresa.value
    }

    await setDoc(doc(db, 'usuarios', userStore.user.uid), usuarioData, { merge: true })

    // Atualiza a store após salvar
    await userStore.refreshUserData()

    router.push(tipo.value === 'profissional' ? '/dashboard-empresa' : '/dashboard')
  } catch (e) {
    console.error('Erro ao salvar dados:', e)
    erro.value = e.message || 'Erro ao salvar dados'

    // Se for erro de autenticação, redireciona para login
    if (e.message.includes('não autenticado') || e.message.includes('Sessão expirada') || e.message.includes('Timeout')) {
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    }
  } finally {
    salvando.value = false
  }
}
</script>

<style scoped>
.input {
  @apply w-full border px-3 py-2 rounded;
}
</style>
