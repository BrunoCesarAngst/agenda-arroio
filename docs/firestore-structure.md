# 🔒 Estrutura e Regras de Segurança do Firestore

> Documentação detalhada da estrutura do banco de dados e regras de segurança do Firebase Firestore para o projeto Agenda Arroio do Sal.

## Visão Geral

Estas regras protegem os dados de sua aplicação de agendamento, permitindo apenas operações legítimas de acordo com o papel de cada usuário (cliente, profissional, admin).

- **Funções auxiliares** são usadas para simplificar e reaproveitar lógica de autenticação e permissões.
- O acesso é controlado por usuário, empresa e também por tipo de usuário.
- As regras são separadas por coleção.

---

## Funções Auxiliares

```javascript
function isAuthenticated() {
  return request.auth != null;
}

function isOwner(userId) {
  return request.auth.uid == userId;
}

function isAdmin() {
  return get(/databases/$(database)/documents/usuarios/$(request.auth.uid)).data.tipo == 'admin';
}
```

* **isAuthenticated**: Retorna `true` se o usuário estiver autenticado.
* **isOwner(userId)**: Retorna `true` se o usuário autenticado for o dono do dado.
* **isAdmin()**: Retorna `true` se o usuário autenticado for do tipo admin.

---

## Coleção: empresas (PÚBLICO)

```javascript
match /empresas/{empresaId} {
  // Leitura: qualquer um pode ler (mesmo não autenticado)
  allow read: if true;

  // Escrita: só usuários autenticados podem criar/editar/deletar
  // (apenas admins ou o proprietário da empresa)
  allow create: if request.auth != null
    && (get(/databases/$(database)/documents/usuarios/$(request.auth.uid)).data.tipo == 'admin'
    || request.auth.uid == request.resource.data.proprietarioId);

  allow update, delete: if request.auth != null
    && (get(/databases/$(database)/documents/usuarios/$(request.auth.uid)).data.tipo == 'admin'
    || request.auth.uid == resource.data.proprietarioId);
}
```

* **Qualquer pessoa pode buscar e listar empresas.**
* **Só o proprietário cadastrado (campo `proprietarioId` no documento) ou admin pode criar/editar/deletar.**

---

## Coleção: usuarios (PRIVADO)

```javascript
match /usuarios/{userId} {
  // Leitura: só autenticado pode ler dados de usuário
  allow read: if request.auth != null
    && (request.auth.uid == userId
    || get(/databases/$(database)/documents/usuarios/$(request.auth.uid)).data.tipo == 'admin');

  // Escrita: só o próprio usuário ou admin pode alterar
  allow write: if request.auth != null
    && (request.auth.uid == userId
    || get(/databases/$(database)/documents/usuarios/$(request.auth.uid)).data.tipo == 'admin');
}
```

* **Só o próprio usuário pode ler seus dados pessoais.**
* **Somente o próprio usuário ou admin pode criar/editar/deletar seu perfil.**
* **Outros usuários e visitantes não podem ver nada dessa coleção.**

---

## Coleção: promocoes

```javascript
match /promocoes/{promoId} {
  allow read: if true;
  allow create: if isAuthenticated() &&
    (isAdmin() || request.resource.data.empresaId == get(/databases/$(database)/documents/usuarios/$(request.auth.uid)).data.empresaId);
  allow update, delete: if isAuthenticated() &&
    (isAdmin() || resource.data.empresaId == get(/databases/$(database)/documents/usuarios/$(request.auth.uid)).data.empresaId);
}
```

* **Leitura**: Qualquer um pode ler promoções (público ou autenticado).
* **Criação**: Apenas usuários autenticados podem criar promoções para sua própria empresa ou se forem admin.
* **Atualizar/Deletar**: Apenas admin ou o dono da empresa relacionada à promoção pode alterar/deletar.

---

## Coleção: servicos

```javascript
match /servicos/{servicoId} {
  allow read: if true;
  allow create: if isAuthenticated() &&
    (isAdmin() || request.resource.data.empresaId == get(/databases/$(database)/documents/usuarios/$(request.auth.uid)).data.empresaId);
  allow update, delete: if isAuthenticated() &&
    (isAdmin() || resource.data.empresaId == get(/databases/$(database)/documents/usuarios/$(request.auth.uid)).data.empresaId);
}
```

* **Leitura**: Qualquer um pode ver os serviços.
* **Criação**: Apenas usuários autenticados podem criar serviços vinculados à própria empresa ou sendo admin.
* **Atualizar/Deletar**: Apenas admin ou o dono da empresa vinculada pode alterar/deletar.

---

## Coleção: agendamentos

```javascript
match /agendamentos/{agendamentoId} {
  allow create: if isAuthenticated() &&
    (isOwner(request.resource.data.clienteId) ||
     request.resource.data.empresaId == get(/databases/$(database)/documents/usuarios/$(request.auth.uid)).data.empresaId);
  allow update, delete: if isAuthenticated() &&
    (isOwner(resource.data.clienteId) ||
     resource.data.empresaId == get(/databases/$(database)/documents/usuarios/$(request.auth.uid)).data.empresaId);
  allow read: if isAuthenticated() &&
    (isOwner(resource.data.clienteId) ||
     resource.data.empresaId == get(/databases/$(database)/documents/usuarios/$(request.auth.uid)).data.empresaId);
}
```

* **Criação**: Apenas o próprio cliente ou um usuário vinculado à empresa do agendamento pode criar.
* **Atualizar/Deletar**: O próprio cliente ou responsável pela empresa pode editar/deletar.
* **Leitura**: O próprio cliente ou responsável pela empresa pode visualizar o agendamento.

---

## Dicas e Observações

* **Importante**: Em `create`, use `request.resource.data` pois o documento ainda não existe.
* **Em update/delete/read**, use `resource.data` pois é o documento já salvo.
* **Referência cruzada**: As regras verificam a ligação do usuário com a empresa usando o campo `empresaId`.
* **Admin**: Admin pode tudo, em qualquer coleção.
* **Leitura pública**: As coleções `servicos`, `promocoes` e `empresas` são públicas para facilitar a listagem e busca de serviços/promos.

---

## Exemplo Completo das Regras

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAuthenticated() {
      return request.auth != null;
    }
    function isOwner(userId) {
      return request.auth.uid == userId;
    }
    function isAdmin() {
      return get(/databases/$(database)/documents/usuarios/$(request.auth.uid)).data.tipo == 'admin';
    }
    // PROMOÇÕES
    match /promocoes/{promoId} {
      allow read: if true;
      allow create: if isAuthenticated() &&
        (isAdmin() || request.resource.data.empresaId == get(/databases/$(database)/documents/usuarios/$(request.auth.uid)).data.empresaId);
      allow update, delete: if isAuthenticated() &&
        (isAdmin() || resource.data.empresaId == get(/databases/$(database)/documents/usuarios/$(request.auth.uid)).data.empresaId);
    }
    // SERVIÇOS
    match /servicos/{servicoId} {
      allow read: if true;
      allow create: if isAuthenticated() &&
        (isAdmin() || request.resource.data.empresaId == get(/databases/$(database)/documents/usuarios/$(request.auth.uid)).data.empresaId);
      allow update, delete: if isAuthenticated() &&
        (isAdmin() || resource.data.empresaId == get(/databases/$(database)/documents/usuarios/$(request.auth.uid)).data.empresaId);
    }
    // EMPRESAS
    match /empresas/{empresaId} {
      allow read: if true;
      allow write: if isAuthenticated() &&
        (isAdmin() || request.auth.uid == resource.data.proprietarioId);
    }
    // USUÁRIOS
    match /usuarios/{userId} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated() && (isOwner(userId) || isAdmin());
    }
    // AGENDAMENTOS
    match /agendamentos/{agendamentoId} {
      allow create: if isAuthenticated() &&
        (isOwner(request.resource.data.clienteId) ||
         request.resource.data.empresaId == get(/databases/$(database)/documents/usuarios/$(request.auth.uid)).data.empresaId);
      allow update, delete: if isAuthenticated() &&
        (isOwner(resource.data.clienteId) ||
         resource.data.empresaId == get(/databases/$(database)/documents/usuarios/$(request.auth.uid)).data.empresaId);
      allow read: if isAuthenticated() &&
        (isOwner(resource.data.clienteId) ||
         resource.data.empresaId == get(/databases/$(database)/documents/usuarios/$(request.auth.uid)).data.empresaId);
    }
  }
}
```

---

## Recomendações Finais

* **Teste as regras no simulador do Firebase!**
  Teste principalmente os fluxos de criar, editar e ler agendamento e promoções, simulando diferentes perfis.
* **Ajuste os nomes dos campos se necessário** para garantir que batem com os seus dados no Firestore.
* **Use os campos `ativo`, `criadoEm`, `atualizadoEm`** para manter o controle de alterações e evitar exclusão física de dados importantes.
