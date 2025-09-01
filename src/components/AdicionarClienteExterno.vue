<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <form @submit.prevent="handleSubmit" class="modal-card">
      <div class="modal-header-mobile">
        <h2 class="modal-title-mobile">Adicionar Cliente Externo</h2>
        <button
          type="button"
          @click="$emit('close')"
          class="close-btn-mobile"
          aria-label="Fechar modal"
          title="Fechar modal"
        >×</button>
      </div>
      <div class="modal-body-mobile">
        <div>
          <label class="label-mobile">Nome do cliente</label>
          <input v-model="nome" required class="input-mobile" placeholder="Nome completo" />
        </div>
        <div>
          <label class="label-mobile">Telefone</label>
          <input v-model="telefone" class="input-mobile" placeholder="(51) 99999-9999" />
        </div>
        <div>
          <label class="label-mobile">E-mail (opcional)</label>
          <input v-model="email" class="input-mobile" type="email" placeholder="cliente@email.com" />
        </div>
        <div>
          <label class="label-mobile">Rua</label>
          <input v-model="endereco.rua" required class="input-mobile" />
        </div>
        <div>
          <label class="label-mobile">Número</label>
          <input v-model="endereco.numero" required class="input-mobile" />
        </div>
        <div>
          <label class="label-mobile">Bairro</label>
          <input v-model="endereco.bairro" required class="input-mobile" />
        </div>
        <div>
          <label class="label-mobile">Complemento</label>
          <input v-model="endereco.complemento" class="input-mobile" />
        </div>
        <div>
          <label class="label-mobile">Referência</label>
          <input v-model="endereco.referencia" class="input-mobile" />
        </div>
        <div>
          <label class="label-mobile">CEP</label>
          <input v-model="endereco.cep" class="input-mobile" />
        </div>
        <div>
          <label class="label-mobile">Cidade</label>
          <input v-model="endereco.cidade" required class="input-mobile" value="Arroio do Sal" readonly />
        </div>
        <div>
          <label class="label-mobile">Estado</label>
          <input v-model="endereco.estado" required class="input-mobile" value="RS" readonly />
        </div>
        <div>
          <label class="label-mobile">Nome do contato</label>
          <input v-model="endereco.contato.nome" class="input-mobile" />
        </div>
        <div>
          <label class="label-mobile">Telefone do contato</label>
          <input v-model="endereco.contato.telefone" class="input-mobile" />
        </div>
        <div class="feedback-mobile">
          <p v-if="erro" class="erro-mobile">{{ erro }}</p>
          <p v-if="sucesso" class="sucesso-mobile">{{ sucesso }}</p>
        </div>
      </div>
      <button :disabled="loading" class="btn-mobile" type="submit">
        {{ loading ? 'Salvando...' : 'Cadastrar cliente' }}
      </button>
    </form>
  </div>
</template>

<script setup>
import { addDoc, collection, getDocs, query, serverTimestamp, where } from 'firebase/firestore'
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { db } from '../services/firebase'
import useAuthUser from '../useAuthUser'

const nome = ref('')
const telefone = ref('')
const email = ref('')
const loading = ref(false)
const erro = ref('')
const sucesso = ref('')

const { user, userData } = useAuthUser()

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

const handleSubmit = async () => {
  console.log('--- [DEBUG] handleSubmit chamado ---')
  loading.value = true
  erro.value = ''
  sucesso.value = ''

  try {
    // Checar duplicidade pelo telefone
    console.log('[DEBUG] Dados do formulário:', { nome: nome.value, telefone: telefone.value, email: email.value })
    if (telefone.value) {
      const q = query(
        collection(db, 'clientes_externos'),
        where('telefone', '==', telefone.value)
      )
      console.log('[DEBUG] Executando query de duplicidade:', q)
      const res = await getDocs(q)
      console.log('[DEBUG] Resultado da query de duplicidade:', res)
      if (!res.empty) {
        erro.value = 'Já existe um cliente com este telefone.'
        loading.value = false
        return
      }
    }

    // Obter empresaId e profissionalId
    const empresaId = userData.value?.empresaId || ''
    const profissionalId = user.value?.uid || ''

    if (!empresaId || !profissionalId) {
      erro.value = 'Não foi possível identificar a empresa ou profissional logado.'
      loading.value = false
      return
    }

    // Criar usuário
    const novoCliente = {
      nome: nome.value,
      telefone: telefone.value || '',
      email: email.value || '',
      ativo: true,
      criadoEm: serverTimestamp(),
      empresaId,
      profissionalId,
      endereco: endereco.value
    }
    console.log('[DEBUG] Objeto a ser enviado para Firestore:', novoCliente)

    const docRef = await addDoc(collection(db, 'clientes_externos'), novoCliente)
    console.log('[DEBUG] Documento criado com ID:', docRef.id)
    sucesso.value = 'Cliente cadastrado com sucesso!'
    nome.value = telefone.value = email.value = ''
    endereco.value = {
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
    }
  } catch (e) {
    console.error('[DEBUG] Erro ao salvar no Firestore:', e)
    erro.value = 'Erro ao salvar: ' + (e.message || e) + '\nObjeto enviado: ' + JSON.stringify({
      nome: nome.value,
      telefone: telefone.value || '',
      email: email.value || '',
      ativo: true,
      criadoEm: '[serverTimestamp]',
      empresaId: userData.value?.empresaId || '',
      profissionalId: user.value?.uid || '',
      endereco: endereco.value
    }, null, 2)
  }
  loading.value = false
}

// Permitir fechar o modal com ESC
function handleEsc(event) {
  if (event.key === 'Escape') {
    // Emite o evento close
    window.dispatchEvent(new CustomEvent('close-modal-adicionar-cliente'))
  }
}
onMounted(() => {
  window.addEventListener('keydown', handleEsc)
  window.addEventListener('close-modal-adicionar-cliente', () => {
    // Emite o evento close para o componente pai
    // (garante que funcione mesmo se o foco não estiver no botão)
    const evt = new CustomEvent('close')
    window.dispatchEvent(evt)
    // Também emite localmente
    // (caso o modal esteja aberto)
    // eslint-disable-next-line vue/require-explicit-emits
    if (typeof $emit === 'function') $emit('close')
  })
})
onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleEsc)
  window.removeEventListener('close-modal-adicionar-cliente', () => {})
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.45);
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  width: 100vw;
}
.modal-card {
  background: #fff;
  border-radius: 1.2rem;
  box-shadow: 0 4px 32px rgba(0,0,0,0.18);
  width: 95vw;
  max-width: 400px;
  padding: 0;
  display: flex;
  flex-direction: column;
  max-height: 95vh;
  overflow: hidden;
  position: relative;
}
.modal-header-mobile {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.2rem 1.2rem 0.5rem 1.2rem;
  border-bottom: 1px solid #f1f5f9;
}
.modal-title-mobile {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e3a8a;
}
.close-btn-mobile {
  background: none;
  border: none;
  font-size: 2rem;
  color: #64748b;
  cursor: pointer;
  line-height: 1;
  margin-left: 0.5rem;
  border-radius: 50%;
  transition: background 0.2s, color 0.2s;
  outline: none;
}
.close-btn-mobile:hover,
.close-btn-mobile:focus {
  background: #e0e7ef;
  color: #1e3a8a;
}
.close-btn-mobile:active {
  background: #cbd5e1;
  color: #1e3a8a;
}
.modal-body-mobile {
  overflow-y: auto;
  padding: 1.2rem;
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}
.label-mobile {
  font-size: 1rem;
  font-weight: 500;
  color: #1e293b;
  margin-bottom: 0.2rem;
  display: block;
}
.input-mobile {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #cbd5e1;
  border-radius: 0.5rem;
  font-size: 1rem;
  margin-top: 0.2rem;
  margin-bottom: 0.1rem;
  background: #f8fafc;
  transition: border 0.2s;
}
.input-mobile:focus {
  border-color: #2563eb;
  outline: none;
  background: #fff;
}
.btn-mobile {
  width: 100%;
  padding: 1rem;
  background: #2563eb;
  color: #fff;
  font-size: 1.1rem;
  font-weight: 700;
  border: none;
  border-radius: 0 0 1.2rem 1.2rem;
  margin-top: 0;
  margin-bottom: 0;
  box-shadow: 0 1px 4px rgba(37,99,235,0.08);
  transition: background 0.2s;
}
.btn-mobile:disabled {
  background: #93c5fd;
  color: #fff;
  cursor: not-allowed;
}
.feedback-mobile {
  min-height: 1.5rem;
  margin-bottom: 0.2rem;
}
.erro-mobile {
  color: #dc2626;
  font-size: 0.95rem;
  text-align: center;
}
.sucesso-mobile {
  color: #16a34a;
  font-size: 0.95rem;
  text-align: center;
}
@media (min-width: 600px) {
  .modal-card {
    max-width: 400px;
  }
}
</style>