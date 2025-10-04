# Fluxo de Login - Agenda Arroio do Sal

```mermaid
flowchart TD
    A[Usuário acessa /login] --> B{Tipo de Login}

    B -->|Email/Senha| C[LoginEmail.vue]
    B -->|Google| D[LoginGoogle.vue]

    C --> E[signInWithEmailAndPassword]
    D --> F[signInWithPopup + GoogleAuthProvider]

    E --> G{Login bem-sucedido?}
    F --> G

    G -->|Não| H[Exibe erro específico]
    G -->|Sim| I[userStore.refreshUserData]

    I --> J[Busca dados do usuário no Firestore]
    J --> K{Usuário existe no Firestore?}

    K -->|Não| L[userStore.userData = null<br/>signOut automático]
    K -->|Sim| M[userStore.userData = dados do Firestore]

    M --> N{Tem perfil completo?<br/>userData.tipo existe?}

    N -->|Não| O[Redireciona para /cadastro<br/>CadastroComplementar.vue]
    N -->|Sim| P[Redireciona para dashboard<br/>baseado no tipo de usuário]

    O --> Q[Usuário preenche dados complementares]
    Q --> R[Salva no Firestore: usuarios/{uid}]
    R --> S{Tipo de usuário?}

    S -->|cliente| T[Redireciona para /dashboard]
    S -->|profissional| U[Redireciona para /dashboard-empresa]

    P --> V{Tipo de usuário?}
    V -->|cliente| W[/dashboard - DashboardPage.vue]
    V -->|profissional| X[/dashboard-empresa - DashboardProfissional.vue]
    V -->|admin| Y[/admin - AdminDashboard.vue]

    %% Navigation Guards
    Z[Router.beforeEach] --> AA{Requires Auth?}
    AA -->|Sim| BB{userStore.isAuthenticated?}
    BB -->|Não| CC[Redireciona para /login]
    BB -->|Sim| DD{hasCompletedProfile?}
    DD -->|Não| EE[Redireciona para /cadastro]
    DD -->|Sim| FF{Requires Admin?}
    FF -->|Sim| GG{userStore.isAdmin?}
    GG -->|Não| HH[Redireciona para /]
    GG -->|Sim| II[Acesso permitido]
    FF -->|Não| JJ{Apenas Profissional?}
    JJ -->|Sim| KK{userStore.isProfissional?}
    KK -->|Não| LL[Redireciona para /]
    KK -->|Sim| II
    JJ -->|Não| II

    %% Admin Login Separado
    MM[Usuário acessa /admin-login] --> NN[AdminLogin.vue]
    NN --> OO[Validação local<br/>VITE_ADMIN_USER + VITE_ADMIN_PASS]
    OO --> PP{Credenciais corretas?}
    PP -->|Não| QQ[Exibe erro]
    PP -->|Sim| RR[localStorage.setItem('admin-auth', 'true')]
    RR --> SS[Redireciona para /admin]

    %% Estados da Store
    TT[useUserStore] --> UU[state: user, userData, loading, error]
    UU --> VV[getters: isAuthenticated, isAdmin, isProfissional, isCliente, hasCompletedProfile]
    UU --> WW[actions: init, logout, refreshUserData]

    WW --> XX[onAuthStateChanged listener]
    XX --> YY[Monitora mudanças de autenticação]
    YY --> ZZ[Atualiza store automaticamente]
```

## Pontos Importantes do Fluxo:

### 1. **Autenticação Dupla**
- Firebase Auth para autenticação
- Firestore para dados do usuário
- Se usuário existe no Auth mas não no Firestore → logout automático

### 2. **Perfil Incompleto**
- Usuário autenticado mas sem `tipo` definido
- Força completar cadastro antes de acessar outras páginas
- Redirecionamento baseado no tipo escolhido

### 3. **Tipos de Usuário**
- **cliente**: Acesso a `/dashboard`
- **profissional**: Acesso a `/dashboard-empresa` e rotas específicas
- **admin**: Acesso a `/admin` (sistema separado)

### 4. **Proteção de Rotas**
- Navigation guards verificam autenticação e permissões
- Modo dev (`VITE_DEV_MODE=true`) ignora todas as proteções
- Proteção por tipo de usuário (`onlyCliente`, `onlyProfissional`, `requiresAdmin`)

### 5. **Login Administrativo**
- Sistema separado com credenciais locais
- Armazenado em `localStorage` como `admin-auth`
- Não usa Firebase Auth para admin
