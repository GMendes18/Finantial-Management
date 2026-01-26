import { PrismaClient, TransactionType } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// Keywords padrão para categorização automática
const DEFAULT_KEYWORDS: Record<string, string[]> = {
  // Despesas
  Alimentacao: [
    'ifood', 'uber eats', 'rappi', 'restaurante', 'lanchonete',
    'mercado', 'supermercado', 'padaria', 'açougue', 'hortifruti',
    'pizza', 'hamburguer', 'sushi', 'delivery', 'marmita',
    'cafe', 'cafeteria', 'starbucks', 'mcdonalds', 'burger king',
  ],
  Transporte: [
    'uber', '99', 'cabify', '99pop', 'indriver',
    'posto', 'combustivel', 'gasolina', 'etanol', 'diesel',
    'estacionamento', 'pedagio', 'ipva', 'onibus', 'metro',
  ],
  Moradia: [
    'aluguel', 'condominio', 'iptu', 'luz', 'energia',
    'agua', 'esgoto', 'gas', 'internet', 'wifi', 'celular',
  ],
  Saude: [
    'farmacia', 'drogaria', 'consulta', 'medico', 'dentista',
    'academia', 'smartfit', 'plano de saude', 'unimed',
  ],
  Lazer: [
    'netflix', 'spotify', 'disney', 'hbo', 'amazon prime',
    'cinema', 'ingresso', 'show', 'teatro', 'viagem', 'hotel',
  ],
  Educacao: [
    'curso', 'faculdade', 'escola', 'udemy', 'alura',
    'livro', 'livraria', 'mensalidade',
  ],
  Compras: [
    'shopping', 'loja', 'americanas', 'mercado livre', 'shopee',
    'aliexpress', 'shein', 'renner', 'roupa', 'sapato',
  ],
  Contas: [
    'fatura', 'cartao', 'nubank', 'inter', 'boleto',
    'parcela', 'emprestimo', 'seguro', 'imposto',
  ],
  // Receitas
  Salario: [
    'salario', 'salário', 'pagamento', 'holerite',
    'adiantamento', 'ferias', 'decimo terceiro', 'bonus',
  ],
  Freelance: [
    'freelance', 'projeto', 'servico', 'consultoria',
    'freela', 'job', 'nota fiscal', 'cliente',
  ],
  Investimentos: [
    'dividendo', 'rendimento', 'juros', 'lucro',
    'acao', 'fii', 'cdb', 'tesouro', 'poupanca',
  ],
  'Outros Ganhos': [
    'venda', 'reembolso', 'devolucao', 'cashback',
    'premio', 'presente', 'transferencia recebida',
  ],
}

async function main() {
  console.info('Seeding database...')

  // Create demo user
  const passwordHash = await bcrypt.hash('123456', 10)

  const user = await prisma.user.upsert({
    where: { email: 'demo@finance.com' },
    update: {},
    create: {
      name: 'Usuario Demo',
      email: 'demo@finance.com',
      passwordHash,
    },
  })

  console.info(`User created: ${user.email} (password: 123456)`)

  // Create categories with keywords for auto-categorization
  const incomeCategories = [
    { name: 'Salario', color: '#22c55e', icon: 'wallet', keywords: DEFAULT_KEYWORDS['Salario'] || [] },
    { name: 'Freelance', color: '#3b82f6', icon: 'laptop', keywords: DEFAULT_KEYWORDS['Freelance'] || [] },
    { name: 'Investimentos', color: '#8b5cf6', icon: 'trending-up', keywords: DEFAULT_KEYWORDS['Investimentos'] || [] },
    { name: 'Outros Ganhos', color: '#14b8a6', icon: 'plus-circle', keywords: DEFAULT_KEYWORDS['Outros Ganhos'] || [] },
  ]

  const expenseCategories = [
    { name: 'Alimentacao', color: '#f97316', icon: 'utensils', keywords: DEFAULT_KEYWORDS['Alimentacao'] || [] },
    { name: 'Transporte', color: '#eab308', icon: 'car', keywords: DEFAULT_KEYWORDS['Transporte'] || [] },
    { name: 'Moradia', color: '#ef4444', icon: 'home', keywords: DEFAULT_KEYWORDS['Moradia'] || [] },
    { name: 'Saude', color: '#ec4899', icon: 'heart', keywords: DEFAULT_KEYWORDS['Saude'] || [] },
    { name: 'Lazer', color: '#06b6d4', icon: 'gamepad', keywords: DEFAULT_KEYWORDS['Lazer'] || [] },
    { name: 'Educacao', color: '#6366f1', icon: 'book', keywords: DEFAULT_KEYWORDS['Educacao'] || [] },
    { name: 'Compras', color: '#a855f7', icon: 'shopping-bag', keywords: DEFAULT_KEYWORDS['Compras'] || [] },
    { name: 'Contas', color: '#64748b', icon: 'file-text', keywords: DEFAULT_KEYWORDS['Contas'] || [] },
  ]

  const createdCategories: Record<string, string> = {}

  for (const cat of incomeCategories) {
    const category = await prisma.category.upsert({
      where: { name_userId: { name: cat.name, userId: user.id } },
      update: { keywords: cat.keywords },
      create: {
        ...cat,
        type: TransactionType.INCOME,
        userId: user.id,
      },
    })
    createdCategories[cat.name] = category.id
  }

  for (const cat of expenseCategories) {
    const category = await prisma.category.upsert({
      where: { name_userId: { name: cat.name, userId: user.id } },
      update: { keywords: cat.keywords },
      create: {
        ...cat,
        type: TransactionType.EXPENSE,
        userId: user.id,
      },
    })
    createdCategories[cat.name] = category.id
  }

  console.info(`${Object.keys(createdCategories).length} categories created`)

  // Create sample transactions for the last 3 months
  const transactions = [
    // December 2025
    { type: TransactionType.INCOME, amount: 8500, description: 'Salario Dezembro', date: '2025-12-05', category: 'Salario' },
    { type: TransactionType.INCOME, amount: 1200, description: 'Projeto freelance website', date: '2025-12-10', category: 'Freelance' },
    { type: TransactionType.EXPENSE, amount: 1800, description: 'Aluguel', date: '2025-12-01', category: 'Moradia' },
    { type: TransactionType.EXPENSE, amount: 450, description: 'Supermercado', date: '2025-12-03', category: 'Alimentacao' },
    { type: TransactionType.EXPENSE, amount: 280, description: 'Conta de luz', date: '2025-12-05', category: 'Contas' },
    { type: TransactionType.EXPENSE, amount: 150, description: 'Uber e transporte', date: '2025-12-08', category: 'Transporte' },
    { type: TransactionType.EXPENSE, amount: 89, description: 'Netflix + Spotify', date: '2025-12-10', category: 'Lazer' },
    { type: TransactionType.EXPENSE, amount: 350, description: 'Farmacia', date: '2025-12-12', category: 'Saude' },
    { type: TransactionType.EXPENSE, amount: 520, description: 'Supermercado', date: '2025-12-15', category: 'Alimentacao' },

    // November 2025
    { type: TransactionType.INCOME, amount: 8500, description: 'Salario Novembro', date: '2025-11-05', category: 'Salario' },
    { type: TransactionType.INCOME, amount: 800, description: 'Dividendos', date: '2025-11-15', category: 'Investimentos' },
    { type: TransactionType.EXPENSE, amount: 1800, description: 'Aluguel', date: '2025-11-01', category: 'Moradia' },
    { type: TransactionType.EXPENSE, amount: 380, description: 'Supermercado', date: '2025-11-05', category: 'Alimentacao' },
    { type: TransactionType.EXPENSE, amount: 250, description: 'Conta de luz', date: '2025-11-07', category: 'Contas' },
    { type: TransactionType.EXPENSE, amount: 200, description: 'Gasolina', date: '2025-11-10', category: 'Transporte' },
    { type: TransactionType.EXPENSE, amount: 450, description: 'Curso online', date: '2025-11-12', category: 'Educacao' },
    { type: TransactionType.EXPENSE, amount: 89, description: 'Netflix + Spotify', date: '2025-11-15', category: 'Lazer' },
    { type: TransactionType.EXPENSE, amount: 600, description: 'Supermercado', date: '2025-11-20', category: 'Alimentacao' },
    { type: TransactionType.EXPENSE, amount: 180, description: 'Restaurante', date: '2025-11-22', category: 'Alimentacao' },
    { type: TransactionType.EXPENSE, amount: 320, description: 'Roupas', date: '2025-11-25', category: 'Compras' },

    // October 2025
    { type: TransactionType.INCOME, amount: 8500, description: 'Salario Outubro', date: '2025-10-05', category: 'Salario' },
    { type: TransactionType.INCOME, amount: 2000, description: 'Projeto app mobile', date: '2025-10-20', category: 'Freelance' },
    { type: TransactionType.EXPENSE, amount: 1800, description: 'Aluguel', date: '2025-10-01', category: 'Moradia' },
    { type: TransactionType.EXPENSE, amount: 420, description: 'Supermercado', date: '2025-10-03', category: 'Alimentacao' },
    { type: TransactionType.EXPENSE, amount: 300, description: 'Conta de luz', date: '2025-10-05', category: 'Contas' },
    { type: TransactionType.EXPENSE, amount: 120, description: 'Uber', date: '2025-10-08', category: 'Transporte' },
    { type: TransactionType.EXPENSE, amount: 89, description: 'Netflix + Spotify', date: '2025-10-10', category: 'Lazer' },
    { type: TransactionType.EXPENSE, amount: 250, description: 'Academia', date: '2025-10-12', category: 'Saude' },
    { type: TransactionType.EXPENSE, amount: 550, description: 'Supermercado', date: '2025-10-18', category: 'Alimentacao' },
    { type: TransactionType.EXPENSE, amount: 400, description: 'Presente aniversario', date: '2025-10-22', category: 'Compras' },
    { type: TransactionType.EXPENSE, amount: 150, description: 'Cinema e pipoca', date: '2025-10-28', category: 'Lazer' },
  ]

  // Delete existing transactions for this user (for clean re-seed)
  await prisma.transaction.deleteMany({
    where: { userId: user.id },
  })

  // Create transactions
  for (const tx of transactions) {
    await prisma.transaction.create({
      data: {
        type: tx.type,
        amount: tx.amount,
        description: tx.description,
        date: new Date(tx.date),
        userId: user.id,
        categoryId: createdCategories[tx.category],
      },
    })
  }

  console.info(`${transactions.length} transactions created`)
  console.info('')
  console.info('='.repeat(50))
  console.info('Seed completed!')
  console.info('='.repeat(50))
  console.info('')
  console.info('Login credentials:')
  console.info('  Email: demo@finance.com')
  console.info('  Password: 123456')
  console.info('')
}

main()
  .catch((e) => {
    console.error('Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
