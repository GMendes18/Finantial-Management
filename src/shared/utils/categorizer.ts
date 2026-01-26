import { Category, TransactionType } from '@prisma/client'

interface CategoryMatch {
  category: Category
  score: number
  matchedKeyword: string | null
}

/**
 * Normaliza texto para comparação (remove acentos, lowercase)
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .trim()
}

/**
 * Calcula score de similaridade entre duas strings
 */
function calculateSimilarity(text: string, keyword: string): number {
  const normalizedText = normalizeText(text)
  const normalizedKeyword = normalizeText(keyword)

  // Match exato
  if (normalizedText === normalizedKeyword) {
    return 100
  }

  // Contém a keyword completa
  if (normalizedText.includes(normalizedKeyword)) {
    // Bonus para keywords maiores (mais específicas)
    return 80 + Math.min(normalizedKeyword.length * 2, 15)
  }

  // Keyword contém o texto (para textos curtos)
  if (normalizedKeyword.includes(normalizedText) && normalizedText.length >= 3) {
    return 60
  }

  // Match parcial - palavras começam com a keyword
  const words = normalizedText.split(/\s+/)
  for (const word of words) {
    if (word.startsWith(normalizedKeyword) || normalizedKeyword.startsWith(word)) {
      return 50 + Math.min(normalizedKeyword.length, 10)
    }
  }

  return 0
}

/**
 * Sugere categoria baseada na descrição usando keywords
 */
export function suggestCategory(
  description: string,
  categories: Category[],
  type: TransactionType
): CategoryMatch | null {
  if (!description || description.trim().length === 0) {
    return null
  }

  const filteredCategories = categories.filter((c) => c.type === type)

  if (filteredCategories.length === 0) {
    return null
  }

  let bestMatch: CategoryMatch | null = null

  for (const category of filteredCategories) {
    const keywords = category.keywords || []

    for (const keyword of keywords) {
      const score = calculateSimilarity(description, keyword)

      if (score > 0 && (!bestMatch || score > bestMatch.score)) {
        bestMatch = {
          category,
          score,
          matchedKeyword: keyword,
        }
      }
    }
  }

  // Retorna apenas se tiver uma confiança mínima
  if (bestMatch && bestMatch.score >= 50) {
    return bestMatch
  }

  return null
}

/**
 * Sugere múltiplas categorias ordenadas por relevância
 */
export function suggestCategories(
  description: string,
  categories: Category[],
  type: TransactionType,
  limit: number = 3
): CategoryMatch[] {
  if (!description || description.trim().length === 0) {
    return []
  }

  const filteredCategories = categories.filter((c) => c.type === type)
  const matches: Map<string, CategoryMatch> = new Map()

  for (const category of filteredCategories) {
    const keywords = category.keywords || []

    for (const keyword of keywords) {
      const score = calculateSimilarity(description, keyword)

      if (score >= 50) {
        const existing = matches.get(category.id)
        if (!existing || score > existing.score) {
          matches.set(category.id, {
            category,
            score,
            matchedKeyword: keyword,
          })
        }
      }
    }
  }

  return Array.from(matches.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
}

/**
 * Keywords padrão para categorias comuns (usado no seed)
 */
export const DEFAULT_KEYWORDS: Record<string, string[]> = {
  // Despesas
  Alimentacao: [
    'ifood', 'uber eats', 'rappi', 'restaurante', 'lanchonete',
    'mercado', 'supermercado', 'padaria', 'açougue', 'hortifruti',
    'pizza', 'hamburguer', 'sushi', 'delivery', 'marmita',
    'cafe', 'cafeteria', 'starbucks', 'mcdonalds', 'burger king',
    'subway', 'kfc', 'outback', 'madero'
  ],
  Transporte: [
    'uber', '99', 'cabify', '99pop', 'indriver',
    'posto', 'combustivel', 'gasolina', 'etanol', 'diesel',
    'estacionamento', 'pedagio', 'ipva', 'licenciamento',
    'onibus', 'metro', 'trem', 'bilhete unico', 'passagem',
    'mecanico', 'oficina', 'borracharia', 'lavagem', 'carro'
  ],
  Moradia: [
    'aluguel', 'condominio', 'iptu', 'luz', 'energia',
    'agua', 'esgoto', 'gas', 'internet', 'wifi',
    'celular', 'telefone', 'manutencao', 'reparo', 'conserto',
    'moveis', 'eletrodomestico', 'decoracao'
  ],
  Saude: [
    'farmacia', 'drogaria', 'droga raia', 'drogasil', 'pague menos',
    'consulta', 'medico', 'dentista', 'psicólogo', 'fisioterapia',
    'exame', 'laboratorio', 'hospital', 'clinica', 'pronto socorro',
    'academia', 'smartfit', 'smart fit', 'bluefit', 'crossfit',
    'plano de saude', 'unimed', 'amil', 'sulamerica', 'bradesco saude'
  ],
  Lazer: [
    'netflix', 'spotify', 'disney', 'hbo', 'amazon prime', 'globoplay',
    'youtube', 'twitch', 'deezer', 'apple music', 'paramount',
    'cinema', 'ingresso', 'show', 'teatro', 'museu', 'parque',
    'viagem', 'hotel', 'airbnb', 'booking', 'passagem aerea',
    'jogo', 'game', 'steam', 'playstation', 'xbox', 'nintendo'
  ],
  Educacao: [
    'curso', 'faculdade', 'universidade', 'escola', 'colegio',
    'udemy', 'coursera', 'alura', 'rocketseat', 'origamid',
    'livro', 'livraria', 'amazon', 'kindle', 'saraiva',
    'material escolar', 'apostila', 'mensalidade'
  ],
  Compras: [
    'shopping', 'loja', 'magazine', 'americanas', 'casas bahia',
    'mercado livre', 'shopee', 'aliexpress', 'shein', 'renner',
    'riachuelo', 'c&a', 'zara', 'hm', 'netshoes', 'centauro',
    'roupa', 'sapato', 'tenis', 'acessorio', 'presente'
  ],
  Contas: [
    'fatura', 'cartao', 'nubank', 'inter', 'itau', 'bradesco',
    'santander', 'caixa', 'banco do brasil', 'c6', 'next',
    'boleto', 'parcela', 'emprestimo', 'financiamento',
    'seguro', 'imposto', 'taxa', 'tarifa', 'anuidade'
  ],
  // Receitas
  Salario: [
    'salario', 'salário', 'pagamento', 'holerite', 'contracheque',
    'adiantamento', 'vale', 'ferias', 'decimo terceiro', '13o',
    'bonus', 'bonificacao', 'plr', 'ppr', 'comissao'
  ],
  Freelance: [
    'freelance', 'projeto', 'servico', 'consultoria', 'trabalho extra',
    'freela', 'job', 'contrato', 'nota fiscal', 'nf', 'pj',
    'cliente', 'pagamento projeto'
  ],
  Investimentos: [
    'dividendo', 'rendimento', 'juros', 'lucro', 'retorno',
    'acao', 'acoes', 'fii', 'fundo', 'cdb', 'lci', 'lca',
    'tesouro', 'selic', 'poupanca', 'renda fixa', 'renda variavel',
    'crypto', 'bitcoin', 'ethereum'
  ],
  'Outros Ganhos': [
    'venda', 'reembolso', 'devolucao', 'cashback', 'desconto',
    'premio', 'sorteio', 'loteria', 'presente', 'doacao recebida',
    'aluguel recebido', 'transferencia recebida'
  ],
}
