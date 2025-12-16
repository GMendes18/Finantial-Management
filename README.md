# Financial Management API

API REST para gerenciamento financeiro pessoal desenvolvida com Node.js, TypeScript e Express.

## Tech Stack

- **Runtime:** Node.js 20+
- **Linguagem:** TypeScript
- **Framework:** Express
- **Banco de Dados:** MySQL 8
- **ORM:** Prisma
- **Validação:** Zod
- **Autenticação:** JWT
- **Testes:** Vitest + Supertest

## Funcionalidades

- Autenticação (registro, login, JWT)
- Gerenciamento de categorias (receitas/despesas)
- CRUD de transações financeiras
- Relatórios e análises
  - Resumo mensal
  - Gastos por categoria
  - Saldo atual
  - Tendência mensal

## Pré-requisitos

- Node.js 20+
- Docker e Docker Compose
- Git

## Instalação

```bash
# Clonar o repositório
git clone https://github.com/GMendes18/Finantial-Management.git
cd Finantial-Management

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env

# Subir o banco de dados
docker compose up -d

# Gerar o Prisma Client
npm run db:generate

# Executar migrations
npm run db:migrate

# (Opcional) Popular o banco com dados de exemplo
npm run db:seed

# Iniciar em desenvolvimento
npm run dev
```

## Scripts Disponíveis

| Script | Descrição |
|--------|-----------|
| `npm run dev` | Inicia em modo desenvolvimento |
| `npm run build` | Compila o projeto |
| `npm start` | Inicia em produção |
| `npm run db:generate` | Gera o Prisma Client |
| `npm run db:migrate` | Executa migrations |
| `npm run db:studio` | Abre o Prisma Studio |
| `npm run db:seed` | Popula o banco |
| `npm test` | Executa testes |
| `npm run lint` | Executa o linter |

## Endpoints da API

### Auth
| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/auth/register` | Criar conta |
| POST | `/auth/login` | Login |

### Users
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/users/me` | Perfil do usuário |
| PUT | `/users/me` | Atualizar perfil |

### Categories
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/categories` | Listar categorias |
| GET | `/categories/:id` | Detalhe da categoria |
| POST | `/categories` | Criar categoria |
| PUT | `/categories/:id` | Editar categoria |
| DELETE | `/categories/:id` | Remover categoria |

### Transactions
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/transactions` | Listar (com filtros) |
| GET | `/transactions/:id` | Detalhe |
| POST | `/transactions` | Criar transação |
| PUT | `/transactions/:id` | Editar |
| DELETE | `/transactions/:id` | Remover |

### Reports
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/reports/summary` | Resumo mensal |
| GET | `/reports/by-category` | Gastos por categoria |
| GET | `/reports/balance` | Saldo atual |
| GET | `/reports/monthly-trend` | Tendência mensal |

## Estrutura do Projeto

```
src/
├── config/              # Configurações (env, etc)
├── database/            # Conexão com banco
├── modules/             # Módulos da aplicação
│   ├── auth/           # Autenticação
│   ├── users/          # Usuários
│   ├── categories/     # Categorias
│   ├── transactions/   # Transações
│   └── reports/        # Relatórios
├── shared/              # Código compartilhado
│   ├── errors/         # Classes de erro
│   ├── middlewares/    # Middlewares
│   ├── types/          # Tipos TypeScript
│   └── utils/          # Utilitários
├── app.ts              # Configuração Express
└── server.ts           # Entry point
```

## Licença

MIT
