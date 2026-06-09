import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createTravelPlan } from '../lib/plan-service'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { city, startDate, endDate } = req.body as {
    city?: string
    startDate?: string
    endDate?: string
  }

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
