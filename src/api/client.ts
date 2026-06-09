import type { PlanResult, TripInput } from '../types'

export async function fetchTravelPlan(input: TripInput): Promise<PlanResult> {
  const response = await fetch('/api/plan', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error ?? '추천을 불러오는데 실패했습니다.')
  }

  return data as PlanResult
}
