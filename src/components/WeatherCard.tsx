import type { WeatherData } from '../types'

interface WeatherCardProps {
  weather: WeatherData
}

const SOURCE_LABELS: Record<WeatherData['source'], string> = {
  openweather: 'OpenWeather 실시간 예보',
  open_meteo: 'Open-Meteo 실시간 예보',
  historical_estimate: '과거 동일 시기 평균 (예상)',
}

export default function WeatherCard({ weather }: WeatherCardProps) {
  const layeringHint =
    weather.tempSpread >= 8
      ? `일교차 ${weather.tempSpread}℃ — 아침·저녁 레이어드 필수`
      : weather.tempSpread >= 5
        ? `일교차 ${weather.tempSpread}℃ — 얇은 겉옷 추천`
        : null

  return (
    <section className="rounded-2xl bg-gradient-to-br from-sky-500 to-sky-600 p-6 text-white shadow-lg">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-sky-100">여행지 날씨 · {weather.tripDays}일</p>
          <h2 className="mt-1 text-2xl font-bold">
            {weather.city}
            <span className="ml-2 text-lg font-normal text-sky-100">{weather.country}</span>
          </h2>
        </div>
        <span className="text-4xl">🌤️</span>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-4 text-center">
        <div className="rounded-xl bg-white/15 px-3 py-4 backdrop-blur-sm">
          <p className="text-xs text-sky-100">평균</p>
          <p className="mt-1 text-2xl font-bold">{weather.avgTemp}℃</p>
        </div>
        <div className="rounded-xl bg-white/15 px-3 py-4 backdrop-blur-sm">
          <p className="text-xs text-sky-100">최고</p>
          <p className="mt-1 text-2xl font-bold">{weather.maxTemp}℃</p>
        </div>
        <div className="rounded-xl bg-white/15 px-3 py-4 backdrop-blur-sm">
          <p className="text-xs text-sky-100">최저</p>
          <p className="mt-1 text-2xl font-bold">{weather.minTemp}℃</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-3 text-sm">
        <span className="rounded-full bg-white/20 px-3 py-1">💧 비 올 확률 {weather.rainChance}%</span>
        <span className="rounded-full bg-white/20 px-3 py-1">{weather.weatherStatus}</span>
        {layeringHint && (
          <span className="rounded-full bg-amber-400/30 px-3 py-1 text-amber-50">🧅 {layeringHint}</span>
        )}
      </div>

      <p className="mt-4 text-xs text-sky-100">{SOURCE_LABELS[weather.source]}</p>
    </section>
  )
}
