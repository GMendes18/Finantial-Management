/**
 * @swagger
 * /reports/summary:
 *   get:
 *     summary: Resumo financeiro do período
 *     description: |
 *       Retorna um resumo com totais de receitas, despesas, saldo e taxa de economia.
 *       - Se não informar período, retorna o mês atual
 *       - Pode filtrar por mês/ano ou por intervalo de datas
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: month
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 12
 *         description: Mês (1-12)
 *         example: 12
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *           minimum: 2000
 *           maximum: 2100
 *         description: Ano
 *         example: 2025
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Data inicial (alternativa ao mês/ano)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Data final (alternativa ao mês/ano)
 *     responses:
 *       200:
 *         description: Resumo do período
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     period:
 *                       type: object
 *                       properties:
 *                         startDate:
 *                           type: string
 *                           format: date-time
 *                         endDate:
 *                           type: string
 *                           format: date-time
 *                     income:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: number
 *                           example: 5000
 *                         count:
 *                           type: number
 *                           example: 2
 *                     expense:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: number
 *                           example: 1500
 *                         count:
 *                           type: number
 *                           example: 15
 *                     balance:
 *                       type: number
 *                       description: Receitas - Despesas
 *                       example: 3500
 *                     savingsRate:
 *                       type: number
 *                       description: Percentual economizado
 *                       example: 70
 *
 * /reports/by-category:
 *   get:
 *     summary: Gastos por categoria
 *     description: |
 *       Agrupa as transações por categoria com totais e percentuais.
 *       Útil para gráficos de pizza ou barras.
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: month
 *         schema:
 *           type: integer
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Transações agrupadas por categoria
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     period:
 *                       type: object
 *                       properties:
 *                         startDate:
 *                           type: string
 *                         endDate:
 *                           type: string
 *                     income:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           category:
 *                             $ref: '#/components/schemas/Category'
 *                           total:
 *                             type: number
 *                           count:
 *                             type: number
 *                           percentage:
 *                             type: number
 *                     expense:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           category:
 *                             $ref: '#/components/schemas/Category'
 *                           total:
 *                             type: number
 *                           count:
 *                             type: number
 *                           percentage:
 *                             type: number
 *
 * /reports/balance:
 *   get:
 *     summary: Saldo total
 *     description: Retorna o saldo total do usuário (todas as transações, sem filtro de data)
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Saldo total
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalIncome:
 *                       type: number
 *                       example: 50000
 *                     totalExpense:
 *                       type: number
 *                       example: 35000
 *                     currentBalance:
 *                       type: number
 *                       example: 15000
 *
 * /reports/monthly-trend:
 *   get:
 *     summary: Tendência mensal
 *     description: |
 *       Retorna a evolução de receitas e despesas nos últimos meses.
 *       Útil para gráficos de linha mostrando tendência.
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: months
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 24
 *           default: 6
 *         description: Quantidade de meses para análise
 *     responses:
 *       200:
 *         description: Tendência mensal
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       month:
 *                         type: string
 *                         example: "2025-12"
 *                       income:
 *                         type: number
 *                         example: 5000
 *                       expense:
 *                         type: number
 *                         example: 3000
 *                       balance:
 *                         type: number
 *                         example: 2000
 */
