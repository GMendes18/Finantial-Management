import swaggerJsdoc from 'swagger-jsdoc'

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Financial Management API',
      version: '1.0.0',
      description: 'API REST para gerenciamento financeiro pessoal',
      contact: {
        name: 'Gabriel Mendes',
        url: 'https://github.com/GMendes18',
      },
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            email: { type: 'string', format: 'email' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Category: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            type: { type: 'string', enum: ['INCOME', 'EXPENSE'] },
            color: { type: 'string', example: '#22c55e' },
            icon: { type: 'string', example: 'wallet' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Transaction: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            type: { type: 'string', enum: ['INCOME', 'EXPENSE'] },
            amount: { type: 'number', example: 150.5 },
            description: { type: 'string' },
            date: { type: 'string', format: 'date-time' },
            categoryId: { type: 'string', format: 'uuid' },
            category: { $ref: '#/components/schemas/Category' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'error' },
            message: { type: 'string' },
          },
        },
        ValidationError: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'error' },
            message: { type: 'string', example: 'Validation failed' },
            errors: {
              type: 'object',
              additionalProperties: {
                type: 'array',
                items: { type: 'string' },
              },
            },
          },
        },
      },
    },
    tags: [
      { name: 'Auth', description: 'Autenticação e registro' },
      { name: 'Users', description: 'Gerenciamento de usuários' },
      { name: 'Categories', description: 'Categorias de receitas e despesas' },
      { name: 'Transactions', description: 'Transações financeiras' },
      { name: 'Reports', description: 'Relatórios e análises' },
    ],
  },
  apis: ['./src/modules/*/*.routes.ts', './src/modules/*/*.swagger.ts'],
}

export const swaggerSpec = swaggerJsdoc(options)
