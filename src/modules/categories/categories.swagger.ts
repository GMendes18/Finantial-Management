/**
 * @swagger
 * /categories:
 *   get:
 *     summary: Listar categorias
 *     description: Retorna todas as categorias do usuário, opcionalmente filtradas por tipo
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [INCOME, EXPENSE]
 *         description: Filtrar por tipo de categoria
 *     responses:
 *       200:
 *         description: Lista de categorias
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
 *                     allOf:
 *                       - $ref: '#/components/schemas/Category'
 *                       - type: object
 *                         properties:
 *                           _count:
 *                             type: object
 *                             properties:
 *                               transactions:
 *                                 type: number
 *                                 example: 5
 *
 *   post:
 *     summary: Criar categoria
 *     description: Cria uma nova categoria de receita ou despesa
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - type
 *             properties:
 *               name:
 *                 type: string
 *                 maxLength: 50
 *                 example: Alimentação
 *               type:
 *                 type: string
 *                 enum: [INCOME, EXPENSE]
 *                 example: EXPENSE
 *               color:
 *                 type: string
 *                 pattern: '^#[0-9A-Fa-f]{6}$'
 *                 example: "#f97316"
 *               icon:
 *                 type: string
 *                 maxLength: 30
 *                 example: utensils
 *               keywords:
 *                 type: array
 *                 items:
 *                   type: string
 *                 maxItems: 20
 *                 example: ["ifood", "restaurante", "mercado"]
 *                 description: Palavras-chave para categorização automática
 *     responses:
 *       201:
 *         description: Categoria criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Category created successfully
 *                 data:
 *                   $ref: '#/components/schemas/Category'
 *       409:
 *         description: Categoria com este nome já existe
 *
 * /categories/{id}:
 *   get:
 *     summary: Obter categoria
 *     description: Retorna uma categoria específica pelo ID
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID da categoria
 *     responses:
 *       200:
 *         description: Dados da categoria
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Category'
 *       404:
 *         description: Categoria não encontrada
 *
 *   put:
 *     summary: Atualizar categoria
 *     description: Atualiza uma categoria existente
 *     tags: [Categories]
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
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [INCOME, EXPENSE]
 *               color:
 *                 type: string
 *               icon:
 *                 type: string
 *               keywords:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Categoria atualizada
 *       404:
 *         description: Categoria não encontrada
 *       409:
 *         description: Nome já em uso
 *
 *   delete:
 *     summary: Remover categoria
 *     description: Remove uma categoria. Não é possível remover categorias com transações vinculadas
 *     tags: [Categories]
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
 *       204:
 *         description: Categoria removida com sucesso
 *       400:
 *         description: Categoria possui transações vinculadas
 *       404:
 *         description: Categoria não encontrada
 *
 * /categories/suggest:
 *   post:
 *     summary: Sugerir categoria
 *     description: Sugere uma categoria com base na descrição da transação usando palavras-chave
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - description
 *               - type
 *             properties:
 *               description:
 *                 type: string
 *                 maxLength: 255
 *                 example: "Compra no iFood"
 *               type:
 *                 type: string
 *                 enum: [INCOME, EXPENSE]
 *                 example: EXPENSE
 *     responses:
 *       200:
 *         description: Sugestão de categoria (null se não encontrar)
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
 *                   nullable: true
 *                   properties:
 *                     categoryId:
 *                       type: string
 *                       format: uuid
 *                     categoryName:
 *                       type: string
 *                       example: Alimentação
 *                     confidence:
 *                       type: number
 *                       example: 85
 *                     matchedKeyword:
 *                       type: string
 *                       example: ifood
 *
 * /categories/suggest/multiple:
 *   post:
 *     summary: Sugerir múltiplas categorias
 *     description: Sugere múltiplas categorias ordenadas por relevância
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 3
 *         description: Número máximo de sugestões
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - description
 *               - type
 *             properties:
 *               description:
 *                 type: string
 *                 example: "Uber para o trabalho"
 *               type:
 *                 type: string
 *                 enum: [INCOME, EXPENSE]
 *     responses:
 *       200:
 *         description: Lista de sugestões de categorias
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
 *                       categoryId:
 *                         type: string
 *                       categoryName:
 *                         type: string
 *                       confidence:
 *                         type: number
 *                       matchedKeyword:
 *                         type: string
 */
