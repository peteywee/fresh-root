import { describe, it, expect } from 'vitest'
import { z } from 'zod'

import { badRequest, ok, serverError, parseJson } from '../validation'

describe('API Validation utilities', () => {
  describe('badRequest', () => {
    it('should return 400 with error structure', async () => {
      const response = badRequest('Invalid input')
      expect(response.status).toBe(400)
      
      const body = await response.json()
      expect(body).toHaveProperty('error')
      expect(body.error).toHaveProperty('message', 'Invalid input')
      expect(body.error).toHaveProperty('code', 'BAD_REQUEST')
    })

    it('should include details when provided', async () => {
      const details = { field: 'email', issue: 'invalid format' }
      const response = badRequest('Validation failed', details)
      const body = await response.json()
      expect(body.error.details).toEqual(details)
    })
  })

  describe('serverError', () => {
    it('should return 500 with error structure', async () => {
      const response = serverError()
      expect(response.status).toBe(500)
      
      const body = await response.json()
      expect(body.error.message).toBe('Internal Server Error')
      expect(body.error.code).toBe('INTERNAL')
    })
  })

  describe('ok', () => {
    it('should return 200 with data', async () => {
      const data = { success: true, items: [] }
      const response = ok(data)
      expect(response.status).toBe(200)
      
      const body = await response.json()
      expect(body).toEqual(data)
    })
  })

  describe('parseJson', () => {
    it('should successfully parse valid JSON', async () => {
      const schema = z.object({ name: z.string() })
      const body = JSON.stringify({ name: 'Test' })
      const request = new Request('http://test.com', {
        method: 'POST',
        body,
      })

      const result = await parseJson(request, schema)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toEqual({ name: 'Test' })
      }
    })

    it('should return validation errors for invalid data', async () => {
      const schema = z.object({ name: z.string(), age: z.number() })
      const body = JSON.stringify({ name: 'Test' }) // missing age
      const request = new Request('http://test.com', {
        method: 'POST',
        body,
      })

      const result = await parseJson(request, schema)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.details).toBeDefined()
        expect(result.details.length).toBeGreaterThan(0)
      }
    })
  })
})
