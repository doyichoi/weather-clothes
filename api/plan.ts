import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createTravelPlan } from '../lib/plan-service'

function parseBody(req: VercelRequest): {
  city?: string
  startDate?: string
  endDate?: string
} {
  if (!req.body) return {}
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body) as { city?: string; startDate?: string; endDate?: string }
    } catch {
      return {}
    }
  }
  return req.body as { city?: string; startDate?: string; endDate?: string }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    const hasKey = Boolean(process.env.OPENAI_API_KEY?.trim())
    return res.status(200).json({
      ok: true,
      openaiConfigured: hasKey,
      message: hasKey ? 'API ready' : 'OPENAI_API_KEY not configured',
    })
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { city, startDate, endDate } = parseBody(req)

  try {
    const result = await createTravelPlan(
      {
        city: city ?? '',
        startDate: startDate ?? '',
        endDate: endDate ?? '',
      },
      process.env,
    )

    return res.status(200).json(result)
  } catch (error) {
    const message = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
    const status = message.includes('입력') ? 400 : 500
    return res.status(status).json({ error: message })
  }
}
