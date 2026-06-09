import type { PlanResult, TripInput } from '../types'

export async function fetchTravelPlan(input: TripInput): Promise<PlanResult> {
  let response: Response

  try {
    response = await fetch('/api/plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    })
  } catch {
    throw new Error('서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.')
  }

  const text = await response.text()

  let data: { error?: string } & Partial<PlanResult>
  try {
    data = JSON.parse(text) as { error?: string } & Partial<PlanResult>
  } catch {
    throw new Error(
      '서버 응답 오류입니다. Vercel Settings → Environment Variables에 OPENAI_API_KEY를 설정한 뒤 Redeploy 해주세요.',
    )
  }

  if (!response.ok) {
    throw new Error(data.error ?? '추천을 불러오는데 실패했습니다.')
  }

  return data as PlanResult
}
