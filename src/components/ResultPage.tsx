import type { PlanResult } from '../types'
import WeatherCard from './WeatherCard'
import OutfitCard from './OutfitCard'
import LocalTipCard from './LocalTipCard'
import EssentialsCard from './EssentialsCard'

interface ResultPageProps {
  result: PlanResult
  onBack: () => void
}

export default function ResultPage({ result, onBack }: ResultPageProps) {
  const { weather, recommendation } = result

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <button
        type="button"
        onClick={onBack}
        className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-sky-700 transition hover:text-sky-900"
      >
        ← 다시 검색하기
      </button>

      <header className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">{weather.city} 여행 코디</h1>
        <p className="mt-2 text-slate-600">
          한국 기온별 기준 + {weather.city} 현지 스타일을 반영한 추천
        </p>
      </header>

      <div className="space-y-5">
        <WeatherCard weather={weather} />
        <OutfitCard recommendation={recommendation} />
        <LocalTipCard
          city={weather.city}
          koreanBaseline={recommendation.koreanBaseline}
          localComparison={recommendation.localComparison}
          localTips={recommendation.localTips}
        />
        <EssentialsCard essentials={recommendation.essentials} />
      </div>
    </div>
  )
}
