# Agenda Arroio do Sal

Sistema de agendamento para a cidade de Arroio do Sal.

## Tecnologias Utilizadas

- Vue.js 3
- TypeScript
- Vite
- Tailwind CSS
- Firebase
- Chart.js
- Jest
- ESLint
- Prettier
- Husky

## Requisitos

- Node.js 18+
- npm 9+

## Instalação

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/agenda-arroio.git
cd agenda-arroio
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env
```

4. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

## Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Compila o projeto para produção
- `npm run preview` - Visualiza a versão de produção localmente
- `npm run test:unit` - Executa os testes unitários
- `npm run test:coverage` - Executa os testes com cobertura
- `npm run lint` - Executa o linter
- `npm run format` - Formata o código

## Estrutura do Projeto

```
src/
  ├── admin/           # Painel administrativo
  ├── components/      # Componentes Vue
  ├── services/        # Serviços (Firebase, etc)
  ├── router/          # Configuração de rotas
  ├── views/           # Páginas da aplicação
  ├── App.vue          # Componente raiz
  └── main.ts          # Ponto de entrada
```

## Testes

O projeto utiliza Jest para testes unitários. Para executar os testes:

```bash
npm run test:unit
```

Para ver a cobertura de testes:

```bash
npm run test:coverage
```

## Linting e Formatação

O projeto utiliza ESLint e Prettier para garantir a qualidade do código. Para executar o linter:

```bash
npm run lint
```

Para formatar o código:

```bash
npm run format
```

## Deploy

O projeto está configurado para deploy no Firebase. Para fazer o deploy:

1. Configure o Firebase:
```bash
firebase login
firebase init
```

2. Faça o build:
```bash
npm run build
```

3. Deploy:
```bash
firebase deploy
```

## Sistema de Backup

O sistema de backup da aplicação permite gerenciar backups do banco de dados Firestore de forma manual e automática.

## Funcionalidades

- Backup manual através da interface administrativa
- Backup automático diário
- Restauração de backups
- Gerenciamento de retenção (30 dias)
- Interface administrativa para gerenciamento de backups

## Configuração

1. Instale as dependências:
```bash
npm install
```

2. Configure as variáveis de ambiente no arquivo `.env`:
```env
VITE_FIREBASE_API_KEY=seu_api_key
VITE_FIREBASE_AUTH_DOMAIN=seu_auth_domain
VITE_FIREBASE_PROJECT_ID=seu_project_id
VITE_FIREBASE_STORAGE_BUCKET=seu_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=seu_messaging_sender_id
VITE_FIREBASE_APP_ID=seu_app_id
VITE_FIREBASE_MEASUREMENT_ID=seu_measurement_id
```

## Uso

### Interface Administrativa

1. Acesse a interface administrativa em `/admin/backup`
2. Use o botão "Criar Backup Agora" para fazer um backup manual
3. Configure o backup automático diário
4. Gerencie os backups existentes (download, restauração, exclusão)

### Backup Manual via CLI

Para criar um backup manual via linha de comando:

```bash
npm run backup:now
```

### Backup Automático

O backup automático é executado diariamente às 00:00. Para iniciar o serviço de backup:

```bash
npm run backup
```

## Estrutura de Dados

Os backups são armazenados em:

- Firestore: Coleção `backups` com metadados
- Storage: Pasta `backups` com arquivos JSON

### Metadados do Backup

```typescript
interface Backup {
  id: string;
  timestamp: Timestamp;
  status: 'in_progress' | 'completed' | 'failed';
  size: number;
  type: 'manual' | 'automatic';
  downloadUrl?: string;
  completedAt?: Timestamp;
  error?: string;
}
```

## Restauração

1. Acesse a interface de restauração em `/admin/backup/restore`
2. Escolha entre restaurar de arquivo ou URL
3. Confirme a restauração

⚠️ **Atenção**: A restauração substituirá todos os dados atuais. Faça um backup antes de restaurar.

## Manutenção

- Os backups são mantidos por 30 dias
- Backups antigos são automaticamente removidos
- O sistema mantém um máximo de 30 backups

## Segurança

- Apenas administradores podem acessar as funcionalidades de backup
- Os backups são armazenados de forma segura no Firebase Storage
- As URLs de download são temporárias e protegidas

## Troubleshooting

### Problemas Comuns

1. **Erro ao criar backup**
   - Verifique as permissões do Firebase
   - Confirme o espaço disponível no Storage
   - Verifique os logs de erro

2. **Erro ao restaurar backup**
   - Verifique se o arquivo é válido
   - Confirme as permissões de escrita
   - Verifique o formato dos dados

3. **Backup automático não está funcionando**
   - Verifique se o serviço está rodando
   - Confirme a configuração do cron
   - Verifique os logs do sistema

### Logs

Os logs de backup podem ser encontrados em:
- Console do Firebase
- Interface administrativa em `/admin/logs`
- Logs do sistema operacional

## Contribuição

Para contribuir com o sistema de backup:

1. Faça um fork do repositório
2. Crie uma branch para sua feature
3. Implemente as mudanças
4. Envie um pull request

## Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo [LICENSE](LICENSE) para mais detalhes.
