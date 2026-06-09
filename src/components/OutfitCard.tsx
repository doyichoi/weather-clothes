import type { Recommendation } from '../types'

interface OutfitCardProps {
  recommendation: Recommendation
}

export default function OutfitCard({ recommendation }: OutfitCardProps) {
  const { completeLook, layers, timeGuide, reason, avoidItems } = recommendation

  return (
    <section className="rounded-2xl bg-white p-6 shadow-md ring-1 ring-slate-100">
      <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
        <span>👗</span>
        추천 코디
      </h2>

      <div className="mt-4 rounded-xl bg-gradient-to-r from-sky-50 to-blue-50 px-4 py-4 ring-1 ring-sky-100">
        <p className="text-xs font-semibold uppercase tracking-wide text-sky-600">이렇게 입으세요</p>
        <p className="mt-2 text-base font-medium leading-relaxed text-slate-800">{completeLook}</p>
      </div>

      <div className="mt-5">
        <p className="mb-3 text-sm font-semibold text-slate-700">레이어드 구성</p>
        <ul className="space-y-2">
          {layers.map((layer) => (
            <li
              key={`${layer.category}-${layer.item}`}
              className="flex gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3"
            >
              <span className="text-2xl">{layer.emoji}</span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-sky-100 px-2 py-0.5 text-xs font-medium text-sky-700">
                    {layer.category}
                  </span>
                  <span className="font-semibold text-slate-800">{layer.item}</span>
                </div>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">{layer.detail}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {timeGuide.length > 0 && (
        <div className="mt-5">
          <p className="mb-3 text-sm font-semibold text-slate-700">시간대별 입기</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {timeGuide.map((guide) => (
              <div
                key={guide.period}
                className="rounded-xl border border-slate-100 bg-white px-4 py-3"
              >
                <p className="text-xs font-medium text-sky-600">{guide.period}</p>
                <p className="mt-1 text-sm font-medium text-slate-800">{guide.outfit}</p>
                <p className="mt-1 text-xs text-slate-500">{guide.note}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-5 rounded-xl bg-amber-50 px-4 py-3">
        <p className="text-sm font-medium text-amber-800">왜 이 코디인가요?</p>
        <p className="mt-1 text-sm leading-relaxed text-amber-900">{reason}</p>
      </div>

      {avoidItems.length > 0 && (
        <div className="mt-4 rounded-xl bg-red-50 px-4 py-3">
          <p className="text-sm font-medium text-red-700">이건 피하세요</p>
          <ul className="mt-2 space-y-1">
            {avoidItems.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-red-800">
                <span className="mt-0.5">✕</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}
