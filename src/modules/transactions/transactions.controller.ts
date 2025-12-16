import { Request, Response } from 'express'
import { transactionsService } from './transactions.service.js'
import { CreateTransactionInput, UpdateTransactionInput, TransactionQuery } from './transactions.schema.js'

export class TransactionsController {
  async findAll(req: Request<unknown, unknown, unknown, TransactionQuery>, res: Response) {
    const userId = req.user!.sub

    const result = await transactionsService.findAll(userId, req.query)

    res.json({
      status: 'success',
      ...result,
    })
  }

  async findById(req: Request<{ id: string }>, res: Response) {
    const userId = req.user!.sub
    const { id } = req.params

    const transaction = await transactionsService.findById(id, userId)

    res.json({
      status: 'success',
      data: transaction,
    })
  }

  async create(req: Request<unknown, unknown, CreateTransactionInput>, res: Response) {
    const userId = req.user!.sub

    const transaction = await transactionsService.create(userId, req.body)

    res.status(201).json({
      status: 'success',
      message: 'Transaction created successfully',
      data: transaction,
    })
  }

  async update(req: Request<{ id: string }, unknown, UpdateTransactionInput>, res: Response) {
    const userId = req.user!.sub
    const { id } = req.params

    const transaction = await transactionsService.update(id, userId, req.body)

    res.json({
      status: 'success',
      message: 'Transaction updated successfully',
      data: transaction,
    })
  }

  async delete(req: Request<{ id: string }>, res: Response) {
    const userId = req.user!.sub
    const { id } = req.params

    await transactionsService.delete(id, userId)

    res.status(204).send()
  }
}

export const transactionsController = new TransactionsController()
