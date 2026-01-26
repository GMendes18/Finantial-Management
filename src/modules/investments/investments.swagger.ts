/**
 * @swagger
 * /investments:
 *   get:
 *     summary: Listar investimentos
 *     description: Retorna todos os investimentos do usuário
 *     tags: [Investments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de investimentos
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
 *                     $ref: '#/components/schemas/Investment'
 *
 *   post:
 *     summary: Criar investimento
 *     description: Adiciona um novo investimento ao portfolio
 *     tags: [Investments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [symbol, name, shares, purchasePrice, purchaseDate]
 *             properties:
 *               symbol:
 *                 type: string
 *                 example: AAPL
 *               name:
 *                 type: string
 *                 example: Apple Inc.
 *               shares:
 *                 type: number
 *                 example: 10
 *               purchasePrice:
 *                 type: number
 *                 example: 150.50
 *               purchaseDate:
 *                 type: string
 *                 format: date
 *                 example: "2024-01-15"
 *               notes:
 *                 type: string
 *                 example: "Long-term hold"
 *     responses:
 *       201:
 *         description: Investimento criado com sucesso
 *
 * /investments/{id}:
 *   get:
 *     summary: Buscar investimento por ID
 *     tags: [Investments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Investimento encontrado
 *       404:
 *         description: Investimento não encontrado
 *
 *   put:
 *     summary: Atualizar investimento
 *     tags: [Investments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               symbol:
 *                 type: string
 *               name:
 *                 type: string
 *               shares:
 *                 type: number
 *               purchasePrice:
 *                 type: number
 *               purchaseDate:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Investimento atualizado
 *       404:
 *         description: Investimento não encontrado
 *
 *   delete:
 *     summary: Excluir investimento
 *     tags: [Investments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Investimento excluído
 *       404:
 *         description: Investimento não encontrado
 *
 * /investments/quotes:
 *   get:
 *     summary: Obter cotações
 *     description: Retorna cotações atuais para os símbolos especificados
 *     tags: [Investments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: symbols
 *         required: true
 *         schema:
 *           type: string
 *         description: Símbolos separados por vírgula (ex. AAPL,GOOGL,MSFT)
 *     responses:
 *       200:
 *         description: Cotações obtidas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   type: object
 *                   additionalProperties:
 *                     type: object
 *                     properties:
 *                       price:
 *                         type: number
 *                       change:
 *                         type: number
 *                       changePercent:
 *                         type: number
 *
 * /investments/portfolio:
 *   get:
 *     summary: Resumo do portfolio
 *     description: Retorna o resumo agregado do portfolio com valores atuais e ganhos/perdas
 *     tags: [Investments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Portfolio summary
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
 *                     totalInvested:
 *                       type: number
 *                       example: 15000.00
 *                     currentValue:
 *                       type: number
 *                       example: 17500.00
 *                     totalGain:
 *                       type: number
 *                       example: 2500.00
 *                     totalGainPercent:
 *                       type: number
 *                       example: 16.67
 *                     positions:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           symbol:
 *                             type: string
 *                           name:
 *                             type: string
 *                           shares:
 *                             type: number
 *                           purchasePrice:
 *                             type: number
 *                           invested:
 *                             type: number
 *                           currentPrice:
 *                             type: number
 *                           currentValue:
 *                             type: number
 *                           gain:
 *                             type: number
 *                           gainPercent:
 *                             type: number
 */
