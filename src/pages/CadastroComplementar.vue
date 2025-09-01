<template>
  <div class="max-w-md mx-auto mt-12 bg-white p-8 rounded-xl shadow space-y-6">
    <h2 class="text-xl font-bold text-center">Complete seu cadastro</h2>

    <div class="flex gap-4 justify-center">
      <button
        :class="tipo === 'cliente' ? selectedBtn : btn"
        @click="tipo = 'cliente'"
      >Sou Cliente</button>
      <button
        :class="tipo === 'profissional' ? selectedBtn : btn"
        @click="tipo = 'profissional'"
      >Sou Prestador/Empresa</button>
    </div>

    <form @submit.prevent="salvar" v-if="tipo">
      <div class="space-y-3">

        <!-- Campos para ambos -->
        <input v-model="nome" type="text" placeholder="Seu nome completo" required class="input" />
        <input v-model="telefone" type="tel" placeholder="Telefone com DDD" required class="input" />

        <!-- Campos só para prestador/empresa -->
        <template v-if="tipo === 'profissional'">
          <input v-model="empresa.nome" type="text" placeholder="Nome da empresa" required class="input" />
          <input v-model="empresa.descricao" type="text" placeholder="Descrição da empresa" required class="input" />
          <input v-model="empresa.endereco" type="text" placeholder="Endereço" required class="input" />
          <!-- Adicione outros campos se quiser -->
        </template>

        <!-- Campos de endereço para cliente -->
        <template v-if="tipo === 'cliente'">
          <div><label>Rua</label><input v-model="endereco.rua" required class="input" /></div>
          <div><label>Número</label><input v-model="endereco.numero" required class="input" /></div>
          <div><label>Bairro</label><input v-model="endereco.bairro" required class="input" /></div>
          <div><label>Complemento</label><input v-model="endereco.complemento" class="input" /></div>
          <div><label>Referência</label><input v-model="endereco.referencia" class="input" /></div>
          <div><label>CEP</label><input v-model="endereco.cep" class="input" /></div>
          <div><label>Cidade</label><input v-model="endereco.cidade" required class="input" value="Arroio do Sal" readonly /></div>
          <div><label>Estado</label><input v-model="endereco.estado" required class="input" value="RS" readonly /></div>
          <div><label>Nome do contato</label><input v-model="endereco.contato.nome" class="input" /></div>
          <div><label>Telefone do contato</label><input v-model="endereco.contato.telefone" class="input" /></div>
        </template>

        <!-- Campos de endereço para empresa -->
        <template v-if="tipo === 'profissional'">
          <input v-model="empresaEndereco.rua" type="text" placeholder="Rua" required class="input" />
          <input v-model="empresaEndereco.numero" type="text" placeholder="Número" required class="input" />
          <input v-model="empresaEndereco.complemento" type="text" placeholder="Complemento" class="input" />
          <input v-model="empresaEndereco.bairro" type="text" placeholder="Bairro" required class="input" />
          <input v-model="empresaEndereco.cidade" type="text" placeholder="Cidade" required class="input" value="Arroio do Sal" readonly />
          <input v-model="empresaEndereco.estado" type="text" placeholder="Estado" required class="input" value="RS" readonly />
          <input v-model="empresaEndereco.cep" type="text" placeholder="CEP" class="input" />
          <input v-model="empresaEndereco.referencia" type="text" placeholder="Referência" class="input" />
          <input v-model="empresaEndereco.contato.nome" type="text" placeholder="Nome do contato" class="input" />
          <input v-model="empresaEndereco.contato.telefone" type="text" placeholder="Telefone do contato" class="input" />
        </template>

        <button :disabled="salvando" type="submit" class="bg-blue-600 w-full py-2 text-white rounded font-bold hover:bg-blue-700">
          {{ salvando ? 'Salvando...' : 'Salvar' }}
        </button>

        <p v-if="erro" class="text-red-600 text-center">{{ erro }}</p>
      </div>
    </form>
  </div>
</template>

<script setup>
import { addDoc, collection, doc, getDoc, getFirestore, serverTimestamp, setDoc } from 'firebase/firestore'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { auth } from '../services/firebase'

const router = useRouter()
const db = getFirestore()

const tipo = ref(null) // 'cliente' ou 'profissional'
const nome = ref('')
const telefone = ref('')
const empresa = ref({
  nome: '',
  descricao: '',
  endereco: ''
})
const endereco = ref({
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
})
const empresaEndereco = ref({
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
})

const erro = ref('')
const salvando = ref(false)

const btn = 'px-4 py-2 border rounded'
const selectedBtn = btn + ' bg-blue-600 text-white'

async function salvar() {
  erro.value = ''
  salvando.value = true
  try {
    const user = auth.currentUser
    if (!user) throw new Error('Usuário não autenticado!')

    console.log('Usuário autenticado:', user)

    // Monta o objeto usuário
    const usuarioData = {
      nome: nome.value,
      telefone: telefone.value,
      email: user.email || '',
      tipo: tipo.value,
      foto: user.photoURL || '',
      ativo: true,
      criadoEm: serverTimestamp(),
      endereco: endereco.value
    }

    console.log('usuarioData:', usuarioData)

    let empresaId = null

    // Se for prestador/empresa, cria também na coleção empresas
    if (tipo.value === 'profissional') {
      const empresaData = {
        nome: empresa.value.nome,
        descricao: empresa.value.descricao,
        endereco: empresaEndereco.value,
        proprietarioId: user.uid,
        ativo: true,
        criadoEm: serverTimestamp()
      }
      const empresaRef = await addDoc(collection(db, 'empresas'), empresaData)
      empresaId = empresaRef.id
      usuarioData.empresaId = empresaId
    }

    // Verifica se o documento já existe
    const userDocRef = doc(db, 'usuarios', user.uid)
    const userDocSnap = await getDoc(userDocRef)
    if (userDocSnap.exists()) {
      // Se for update, remove criadoEm
      delete usuarioData.criadoEm
    }

    // Salva o usuário em /usuarios
    await setDoc(userDocRef, usuarioData, { merge: true })

    // Redireciona conforme o tipo
    if (tipo.value === 'profissional') {
      router.push('/dashboard-empresa')
    } else {
      router.push('/dashboard')
    }
  } catch (e) {
    erro.value = e.message || 'Erro ao salvar dados'
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
