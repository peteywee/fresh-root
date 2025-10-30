import { describe, it, expect } from 'vitest'

import { HttpError, apiFetch } from '../http'

describe('HttpError', () => {
  it('should create an HttpError with status and message', () => {
    const error = new HttpError(404, 'Not found', 'NOT_FOUND')
    expect(error.status).toBe(404)
    expect(error.message).toBe('Not found')
    expect(error.code).toBe('NOT_FOUND')
  })

  it('should include details when provided', () => {
    const details = { field: 'email' }
    const error = new HttpError(400, 'Invalid email', 'VALIDATION_ERROR', details)
    expect(error.details).toEqual(details)
  })
})

describe('apiFetch', () => {
  it('should throw HttpError on non-2xx response', async () => {
    // Mock fetch to return an error response
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      headers: new Headers({ 'content-type': 'application/json' }),
      text: async () => JSON.stringify({
        error: { code: 'NOT_FOUND', message: 'Resource not found' }
      })
    })

    await expect(apiFetch('/api/test')).rejects.toThrow(HttpError)
  })

  it('should return parsed JSON on successful response', async () => {
    const mockData = { id: 1, name: 'Test' }
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      text: async () => JSON.stringify(mockData)
    })

    const result = await apiFetch('/api/test')
    expect(result).toEqual(mockData)
  })
})
