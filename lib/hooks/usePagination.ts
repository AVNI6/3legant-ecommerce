
import { useState, useCallback, useMemo } from 'react'
import { PaginatedResponse } from '@/types/utils'

export interface UsePaginationOptions {
  pageSize?: number
  initialPage?: number
  onPageChange?: (page: number) => void
}

export interface UsePaginationReturn {
  page: number
  pageSize: number
  totalPages: number
  totalItems: number
  hasNextPage: boolean
  hasPreviousPage: boolean
  goToPage: (page: number) => void
  nextPage: () => void
  previousPage: () => void
  setPageSize: (size: number) => void
}

/**
 * Hook for managing pagination state
 */
export function usePagination(
  totalItems: number = 0,
  options: UsePaginationOptions = {}
): UsePaginationReturn {
  const pageSize = options.pageSize || 20
  const [page, setPage] = useState(options.initialPage || 1)

  const totalPages = Math.ceil(totalItems / pageSize)
  const hasNextPage = page < totalPages
  const hasPreviousPage = page > 1

  const goToPage = useCallback(
    (newPage: number) => {
      const validPage = Math.max(1, Math.min(newPage, totalPages))
      setPage(validPage)
      options.onPageChange?.(validPage)
    },
    [totalPages, options]
  )

  const nextPage = useCallback(() => {
    if (hasNextPage) goToPage(page + 1)
  }, [page, hasNextPage, goToPage])

  const previousPage = useCallback(() => {
    if (hasPreviousPage) goToPage(page - 1)
  }, [page, hasPreviousPage, goToPage])

  const handleSetPageSize = useCallback(
    (size: number) => {
      // When page size changes, adjust current page if needed
      const newTotalPages = Math.ceil(totalItems / size)
      const validPage = Math.min(page, newTotalPages)
      setPage(validPage)
    },
    [page, totalItems]
  )

  return {
    page,
    pageSize,
    totalPages,
    totalItems,
    hasNextPage,
    hasPreviousPage,
    goToPage,
    nextPage,
    previousPage,
    setPageSize: handleSetPageSize,
  }
}

/**
 * Paginate an array of items
 */
export function paginateArray<T>(
  items: T[],
  page: number,
  pageSize: number
): { data: T[]; total: number; page: number; pageSize: number; hasMore: boolean } {
  const total = items.length
  const start = (page - 1) * pageSize
  const end = start + pageSize
  const data = items.slice(start, end)

  return {
    data,
    total,
    page,
    pageSize,
    hasMore: end < total,
  }
}

/**
 * Create pagination query parameters for API calls
 */
export function createPaginationParams(page: number, pageSize: number) {
  return {
    offset: (page - 1) * pageSize,
    limit: pageSize,
  }
}

/**
 * Parse Supabase paginated response
 */
export function parsePaginatedResponse<T>(
  response: any[],
  page: number,
  pageSize: number,
  total: number
): PaginatedResponse<T> {
  return {
    data: response || [],
    total,
    page,
    pageSize,
    hasMore: page * pageSize < total,
    totalPages: Math.ceil(total / pageSize),
  }
}

/**
 * Build Supabase query with pagination
 */
export function buildPaginatedQuery(page: number, pageSize: number) {
  const params = createPaginationParams(page, pageSize)
  return {
    range: {
      from: params.offset,
      to: params.offset + params.limit - 1,
    },
    limit: params.limit,
    offset: params.offset,
  }
}
