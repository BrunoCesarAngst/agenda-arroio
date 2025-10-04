# Melhorias na Verificação de Autenticação

## Problema Identificado

O sistema estava apresentando o erro "Usuário não autenticado!" mesmo quando o usuário estava logado. Isso acontecia devido a:

1. **Race conditions**: Tentativas de executar operações antes dos dados do usuário estarem carregados
2. **Verificação inconsistente**: Uso de `auth.currentUser` diretamente em vez do hook `useAuthUser`
3. **Falta de validação de token**: Não verificava se o token ainda era válido antes de operações críticas
4. **Ausência de timeout**: Não havia limite de tempo para aguardar carregamento dos dados

## Soluções Implementadas

### 1. Hook `useAuthUser` Melhorado

```javascript
// src/useAuthUser.js
async function fetchUserData(firebaseUser) {
  if (!firebaseUser) {
    userData.value = null
    return
  }

  try {
    // Verifica se o token ainda é válido antes de buscar dados
    await firebaseUser.getIdToken(true)

    const userDoc = await getDoc(doc(db, 'usuarios', firebaseUser.uid))
    if (userDoc.exists()) {
      userData.value = userDoc.data()
    } else {
      // Usuário autenticado mas não existe no Firestore
      userData.value = {
        nome: firebaseUser.displayName || '',
        email: firebaseUser.email || '',
        telefone: '',
        foto: firebaseUser.photoURL || '',
        tipo: null // Marca como perfil incompleto
      }
    }
  } catch (error) {
    console.error('Erro ao buscar dados do usuário:', error)
    userData.value = null
  }
}
```

### 2. Funções Utilitárias de Autenticação

Criado arquivo `src/utils/authUtils.js` com funções reutilizáveis:

```javascript
/**
 * Verifica se o usuário está autenticado e com token válido
 */
export async function verifyUserAuth(firebaseUser, timeout = 5000) {
  if (!firebaseUser) return false

  try {
    await firebaseUser.getIdToken(true)
    return true
  } catch (error) {
    console.error('Token inválido ou expirado:', error)
    return false
  }
}

/**
 * Aguarda o carregamento dos dados do usuário com timeout
 */
export function waitForUserData(checkFunction, timeout = 10000) {
  return new Promise((resolve) => {
    const startTime = Date.now()
    const checkInterval = setInterval(() => {
      if (checkFunction()) {
        clearInterval(checkInterval)
        resolve(true)
      } else if (Date.now() - startTime > timeout) {
        clearInterval(checkInterval)
        resolve(false)
      }
    }, 100)
  })
}
```

### 3. Verificação Robusta em Componentes

#### Antes:
```javascript
async function salvar() {
  const user = auth.currentUser
  if (!user) throw new Error('Usuário não autenticado!')
  // ... resto do código
}
```

#### Depois:
```javascript
async function salvar() {
  // Aguarda o carregamento dos dados com timeout
  const dataLoaded = await waitForUserData(() => !loading.value, 10000)
  if (!dataLoaded) {
    throw new Error('Timeout aguardando carregamento dos dados do usuário.')
  }

  if (!user.value) {
    throw new Error('Usuário não autenticado! Faça login novamente.')
  }

  // Verifica se o token ainda é válido
  const isAuthValid = await verifyUserAuth(user.value)
  if (!isAuthValid) {
    throw new Error('Sessão expirada. Faça login novamente.')
  }

  // ... resto do código
}
```

### 4. Indicadores Visuais de Carregamento

```vue
<template>
  <!-- Indicador de carregamento -->
  <div v-if="loading" class="text-center py-4">
    <p class="text-gray-600">Carregando dados do usuário...</p>
  </div>

  <form v-else @submit.prevent="salvar">
    <!-- formulário só aparece quando dados estão carregados -->
  </form>
</template>
```

### 5. Tratamento de Erros Melhorado

```javascript
try {
  // ... operação
} catch (e) {
  console.error('Erro ao salvar dados:', e)
  erro.value = e.message || 'Erro ao salvar dados'

  // Redireciona para login se erro de autenticação
  if (e.message.includes('não autenticado') ||
      e.message.includes('Sessão expirada') ||
      e.message.includes('Timeout')) {
    setTimeout(() => {
      router.push('/login')
    }, 2000)
  }
}
```

## Como Usar em Outros Componentes

### 1. Importe as funções utilitárias:
```javascript
import { verifyUserAuth, waitForUserData } from '../utils/authUtils'
import useAuthUser from '../useAuthUser'

const { user, userData, loading } = useAuthUser()
```

### 2. Aguarde o carregamento antes de operações críticas:
```javascript
async function operacaoCritica() {
  // Aguarda carregamento
  const dataLoaded = await waitForUserData(() => !loading.value, 10000)
  if (!dataLoaded) {
    throw new Error('Timeout aguardando dados do usuário.')
  }

  // Verifica autenticação
  if (!user.value) {
    throw new Error('Usuário não autenticado!')
  }

  // Verifica token válido
  const isAuthValid = await verifyUserAuth(user.value)
  if (!isAuthValid) {
    throw new Error('Sessão expirada.')
  }

  // Execute a operação
}
```

### 3. Use indicadores visuais:
```vue
<div v-if="loading">Carregando...</div>
<div v-else-if="!user">Não autenticado</div>
<div v-else>Conteúdo da página</div>
```

## Benefícios

1. **Eliminação de race conditions**: Aguarda dados estarem prontos
2. **Verificação robusta de token**: Evita operações com tokens expirados
3. **Melhor UX**: Indicadores visuais de carregamento
4. **Tratamento consistente**: Funções reutilizáveis para verificação
5. **Timeout configurável**: Evita travamentos indefinidos
6. **Redirecionamento automático**: Leva usuário para login quando necessário

## Arquivos Modificados

- `src/pages/CadastroComplementar.vue` - Implementação completa das melhorias
- `src/useAuthUser.js` - Melhor validação de token
- `src/utils/authUtils.js` - Novas funções utilitárias (criado)
- `src/pages/Dashboard.vue` - Exemplo de aplicação das melhorias
- `docs/auth-improvements.md` - Esta documentação (criado)
