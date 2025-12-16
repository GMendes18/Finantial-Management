import { PaginatedResponse, PaginationParams } from '../types/index.js'

export function paginate<T>(
  data: T[],
  total: number,
  { page, limit }: PaginationParams
): PaginatedResponse<T> {
  return {
    data,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  }
}

export function getPaginationParams(query: { page?: string; limit?: string }): PaginationParams {
  const page = Math.max(1, parseInt(query.page || '1', 10))
  const limit = Math.min(100, Math.max(1, parseInt(query.limit || '10', 10)))
  return { page, limit }
}
