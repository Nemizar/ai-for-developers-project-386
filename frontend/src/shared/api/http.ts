import type { ApiErrorPayload } from './types'

export class ApiError extends Error {
  status: number
  code: string
  details?: string

  constructor(status: number, payload: ApiErrorPayload) {
    super(payload.message)
    this.name = 'ApiError'
    this.status = status
    this.code = payload.code
    this.details = payload.details
  }
}

const baseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:4010'

export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  })

  if (!response.ok) {
    let payload: ApiErrorPayload = { code: 'unknown_error', message: 'Unexpected API error' }

    try {
      payload = (await response.json()) as ApiErrorPayload
    } catch {
      payload.message = `${payload.message}: ${response.status}`
    }

    throw new ApiError(response.status, payload)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return (await response.json()) as T
}

export function toQuery(params: Record<string, string | undefined>) {
  const searchParams = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      searchParams.set(key, value)
    }
  })

  const query = searchParams.toString()
  return query ? `?${query}` : ''
}
