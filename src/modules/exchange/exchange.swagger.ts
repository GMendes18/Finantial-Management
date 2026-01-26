/**
 * @swagger
 * /exchange/rates:
 *   get:
 *     summary: Obter cotações atuais
 *     description: Retorna as cotações de câmbio mais recentes
 *     tags: [Exchange]
 *     parameters:
 *       - in: query
 *         name: base
 *         schema:
 *           type: string
 *           default: BRL
 *         description: Moeda base (3 caracteres)
 *       - in: query
 *         name: symbols
 *         schema:
 *           type: string
 *           default: USD,EUR,GBP
 *         description: Moedas para cotação (separadas por vírgula)
 *     responses:
 *       200:
 *         description: Cotações obtidas com sucesso
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
 *                     base:
 *                       type: string
 *                       example: BRL
 *                     date:
 *                       type: string
 *                       example: "2026-01-26"
 *                     rates:
 *                       type: object
 *                       additionalProperties:
 *                         type: number
 *                       example:
 *                         USD: 0.189
 *                         EUR: 0.158
 *
 * /exchange/history:
 *   get:
 *     summary: Obter histórico de cotações
 *     description: Retorna o histórico de cotações para um período
 *     tags: [Exchange]
 *     parameters:
 *       - in: query
 *         name: base
 *         schema:
 *           type: string
 *           default: BRL
 *       - in: query
 *         name: symbols
 *         schema:
 *           type: string
 *           default: USD,EUR,GBP
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           default: 7
 *           minimum: 1
 *           maximum: 30
 *         description: Número de dias de histórico
 *     responses:
 *       200:
 *         description: Histórico obtido com sucesso
 *
 * /exchange/widget:
 *   get:
 *     summary: Dados para widget de cotações
 *     description: Retorna dados formatados para o widget do dashboard (cotação atual + sparkline + variação)
 *     tags: [Exchange]
 *     parameters:
 *       - in: query
 *         name: base
 *         schema:
 *           type: string
 *           default: BRL
 *       - in: query
 *         name: symbols
 *         schema:
 *           type: string
 *           default: USD,EUR,GBP
 *     responses:
 *       200:
 *         description: Dados do widget
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     base:
 *                       type: string
 *                     date:
 *                       type: string
 *                     currencies:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           symbol:
 *                             type: string
 *                             example: USD
 *                           rate:
 *                             type: number
 *                             example: 0.189
 *                           inverseRate:
 *                             type: number
 *                             example: 5.29
 *                           variation:
 *                             type: number
 *                             example: -1.5
 *                           trend:
 *                             type: string
 *                             enum: [up, down]
 *                           sparkline:
 *                             type: array
 *                             items:
 *                               type: number
 */
