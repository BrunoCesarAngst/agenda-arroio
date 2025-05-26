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

        <button :disabled="salvando" type="submit" class="bg-blue-600 w-full py-2 text-white rounded font-bold hover:bg-blue-700">
          {{ salvando ? 'Salvando...' : 'Salvar' }}
        </button>

        <p v-if="erro" class="text-red-600 text-center">{{ erro }}</p>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { auth } from '../services/firebase'
import { getFirestore, doc, setDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore'

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

    // Monta o objeto usuário
    const usuarioData = {
      id: user.uid,
      nome: nome.value,
      telefone: telefone.value,
      email: user.email || '',
      tipo: tipo.value,
      foto: user.photoURL || '',
      ativo: true,
      criadoEm: serverTimestamp()
    }

    let empresaId = null

    // Se for prestador/empresa, cria também na coleção empresas
    if (tipo.value === 'profissional') {
      const empresaData = {
        nome: empresa.value.nome,
        descricao: empresa.value.descricao,
        endereco: empresa.value.endereco,
        proprietarioId: user.uid,
        ativo: true,
        criadoEm: serverTimestamp()
      }
      const empresaRef = await addDoc(collection(db, 'empresas'), empresaData)
      empresaId = empresaRef.id
      usuarioData.empresaId = empresaId
    }

    // Salva o usuário em /usuarios
    await setDoc(doc(db, 'usuarios', user.uid), usuarioData, { merge: true })

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
