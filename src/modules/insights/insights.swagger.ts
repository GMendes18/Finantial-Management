/**
 * @swagger
 * /insights:
 *   get:
 *     summary: Obter insights financeiros
 *     description: Retorna insights personalizados baseados no histórico de transações. Usa IA (Gemini) quando disponível, ou regras inteligentes como fallback. Resultados são cacheados por 24 horas.
 *     tags: [Insights]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: refresh
 *         schema:
 *           type: string
 *           enum: ['true', 'false']
 *         description: Forçar atualização dos insights (ignora cache)
 *     responses:
 *       200:
 *         description: Insights gerados com sucesso
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
 *                     generatedAt:
 *                       type: string
 *                       format: date-time
 *                     insights:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           type:
 *                             type: string
 *                             enum: [alert, tip, achievement, trend]
 *                           title:
 *                             type: string
 *                             example: "Excelente taxa de economia!"
 *                           description:
 *                             type: string
 *                             example: "Você está economizando 25% da sua renda."
 *                           icon:
 *                             type: string
 *                             enum: [alert-circle, lightbulb, trophy, trending-up]
 *                     summary:
 *                       type: object
 *                       properties:
 *                         totalIncome:
 *                           type: number
 *                         totalExpense:
 *                           type: number
 *                         balance:
 *                           type: number
 *                         topCategory:
 *                           type: string
 *                         topCategoryAmount:
 *                           type: number
 *                         savingsRate:
 *                           type: number
 *       401:
 *         description: Não autenticado
 */
