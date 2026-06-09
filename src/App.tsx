import { useState } from 'react'
import HomePage from './components/HomePage'
import ResultPage from './components/ResultPage'
import { fetchTravelPlan } from './api/client'
import type { PlanResult } from './types'

function App() {
  const [city, setCity] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<PlanResult | null>(null)

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)

    try {
      const plan = await fetchTravelPlan({ city, startDate, endDate })
      setResult(plan)
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  if (result) {
    return <ResultPage result={result} onBack={() => setResult(null)} />
  }

  return (
    <HomePage
      city={city}
      startDate={startDate}
      endDate={endDate}
      loading={loading}
      error={error}
      onCityChange={setCity}
      onStartDateChange={setStartDate}
      onEndDateChange={setEndDate}
      onSubmit={handleSubmit}
    />
  )
}

export default App
