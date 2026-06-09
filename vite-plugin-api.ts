import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Plugin } from 'vite'
import { loadEnv } from 'vite'
import { createTravelPlan } from './api/lib/plan-service'

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = ''
    req.on('data', (chunk) => {
      data += chunk
    })
    req.on('end', () => resolve(data))
    req.on('error', reject)
  })
}

function sendJson(res: ServerResponse, status: number, payload: unknown) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(payload))
}

export function apiPlugin(): Plugin {
  return {
    name: 'travel-outfit-api',
    configureServer(server) {
      const env = loadEnv(server.config.mode, server.config.root, '')

      server.middlewares.use(async (req, res, next) => {
        if (req.url !== '/api/plan') {
          return next()
        }

        if (req.method === 'GET') {
          const hasKey = Boolean(env.OPENAI_API_KEY?.trim())
          sendJson(res, 200, {
            ok: true,
            openaiConfigured: hasKey,
            message: hasKey ? 'API ready' : 'OPENAI_API_KEY not configured',
          })
          return
        }

        if (req.method !== 'POST') {
          sendJson(res, 405, { error: 'Method not allowed' })
          return
        }

        try {
          const body = await readBody(req)
          const { city, startDate, endDate } = JSON.parse(body) as {
            city?: string
            startDate?: string
            endDate?: string
          }

          const result = await createTravelPlan(
            {
              city: city ?? '',
              startDate: startDate ?? '',
              endDate: endDate ?? '',
            },
            env,
          )

          sendJson(res, 200, result)
        } catch (error) {
          const message =
            error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
          const status = message.includes('입력') ? 400 : 500
          sendJson(res, status, { error: message })
        }
      })
    },
  }
}
