import type { LocalComparison } from '../types'

interface LocalTipCardProps {
  city: string
  koreanBaseline: string
  localComparison: LocalComparison
  localTips: string[]
}

export default function LocalTipCard({
  city,
  koreanBaseline,
  localComparison,
  localTips,
}: LocalTipCardProps) {
  return (
    <section className="rounded-2xl bg-white p-6 shadow-md ring-1 ring-slate-100">
      <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
        <span>🗺️</span>
        {city} 현지 vs 한국 기준
      </h2>

      <div className="mt-4 space-y-3">
        <div className="rounded-xl bg-slate-50 px-4 py-3">
          <p className="text-xs font-semibold text-slate-500">🇰🇷 한국 기온별 기준</p>
          <p className="mt-1 text-sm leading-relaxed text-slate-800">{koreanBaseline}</p>
        </div>

        <div className="rounded-xl bg-sky-50 px-4 py-3 ring-1 ring-sky-100">
          <p className="text-xs font-semibold text-sky-600">📍 {city} 현지인은 이렇게 입어요</p>
          <p className="mt-1 text-sm leading-relaxed text-slate-800">{localComparison.localReality}</p>
        </div>

        <div className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3">
          <p className="text-xs font-semibold text-amber-700">💡 한국과 다른 점</p>
          <p className="mt-1 text-sm leading-relaxed text-amber-900">{localComparison.keyDifference}</p>
        </div>
      </div>

      {localTips.length > 0 && (
        <ul className="mt-4 space-y-2">
          {localTips.map((tip) => (
            <li key={tip} className="flex items-start gap-2 text-sm text-slate-700">
              <span className="mt-0.5 text-sky-500">•</span>
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
