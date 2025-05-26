# 🏖️ Agenda Arroio do Sal

[![Vue.js](https://img.shields.io/badge/Vue.js-3.x-4FC08D?style=flat-square&logo=vue.js&logoColor=white)](https://vuejs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Firebase-10.x-FFCA28?style=flat-square&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](LICENSE)

> Plataforma de agendamento de serviços para a cidade de Arroio do Sal, RS. Conectando profissionais e clientes de forma eficiente e segura.

## 🚀 Tecnologias

Este projeto foi construído com as seguintes tecnologias:

- **Frontend**
  - [Vue.js 3](https://vuejs.org/) - Framework progressivo para construção de interfaces
  - [Tailwind CSS](https://tailwindcss.com/) - Framework CSS utility-first
  - [Vite](https://vitejs.dev/) - Build tool e dev server
  - [Vue Router](https://router.vuejs.org/) - Roteamento oficial do Vue.js

- **Backend & Infraestrutura**
  - [Firebase](https://firebase.google.com/)
    - Authentication - Autenticação de usuários
    - Firestore - Banco de dados NoSQL
    - Security Rules - Regras de segurança personalizadas
    - Hosting - Hospedagem da aplicação

## 🎯 Funcionalidades

- **Autenticação**
  - Login com email/senha
  - Login com Google
  - Login com telefone (SMS)
  - Recuperação de senha

- **Agendamento**
  - Busca de profissionais
  - Agendamento de serviços
  - Confirmação por SMS/Email
  - Histórico de agendamentos

- **Profissionais**
  - Cadastro de serviços
  - Gestão de agenda
  - Perfil personalizado
  - Avaliações e comentários

- **Promoções**
  - Sistema de descontos
  - Cupons promocionais
  - Notificações de ofertas

## 🏗️ Arquitetura

O projeto segue uma arquitetura modular e escalável:

```
src/
├── assets/          # Recursos estáticos
├── components/      # Componentes reutilizáveis
│   └── auth/        # Componentes de autenticação
├── pages/          # Páginas da aplicação
├── router/         # Configuração de rotas
├── services/       # Serviços e integrações
│   └── firebase/   # Configuração do Firebase
└── stores/         # Gerenciamento de estado
```

## 🚀 Começando

### Pré-requisitos

- Node.js 18.x ou superior
- npm 9.x ou superior
- Conta no Firebase

### Instalação

1. Clone o repositório
```bash
git clone https://github.com/BrunoCesarAngst/agenda-arroio.git
cd agenda-arroio
```

2. Instale as dependências
```bash
npm install
```

3. Configure as variáveis de ambiente
```bash
cp .env.example .env
```
Edite o arquivo `.env` com suas credenciais do Firebase.

4. Inicie o servidor de desenvolvimento
```bash
npm run dev
```

## 🔧 Configuração do Firebase

1. Crie um projeto no [Firebase Console](https://console.firebase.google.com)
2. Ative os serviços:
   - Authentication
   - Firestore
   - Hosting
3. Configure as regras de segurança do Firestore (veja `docs/firestore-structure.md`)
4. Adicione suas credenciais no arquivo `.env`

## 📦 Build e Deploy

```bash
# Build para produção
npm run build

# Preview do build
npm run preview

# Deploy para Firebase
npm run deploy
```

## 🧪 Testes

```bash
# Executa os testes unitários
npm run test:unit

# Executa os testes e2e
npm run test:e2e
```

## 📚 Documentação

- [Estrutura do Firestore](docs/firestore-structure.md)
- [Guia de Contribuição](CONTRIBUTING.md)
- [Código de Conduta](CODE_OF_CONDUCT.md)

## 🤝 Contribuindo

1. Fork o projeto
2. Crie sua branch de feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'feat: add some amazing feature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👥 Autores

- **Bruno Cesar Angst** - *Desenvolvimento* - [GitHub](https://github.com/BrunoCesarAngst)

## 🙏 Agradecimentos

- Comunidade Vue.js
- Equipe do Tailwind CSS
- Firebase Team
- Todos os contribuidores

---

⭐️ From [BrunoCesarAngst](https://github.com/BrunoCesarAngst)
