import type { EssentialItem } from '../types'

interface EssentialsCardProps {
  essentials: EssentialItem[]
}

export default function EssentialsCard({ essentials }: EssentialsCardProps) {
  return (
    <section className="rounded-2xl bg-white p-6 shadow-md ring-1 ring-slate-100">
      <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
        <span>🎒</span>
        현지에서 챙길 준비물
      </h2>
      <p className="mt-1 text-sm text-slate-500">한국 기준과 달리 현지에서 특히 필요한 것</p>

      <ul className="mt-4 space-y-3">
        {essentials.map((essential) => (
          <li
            key={essential.item}
            className="flex gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3"
          >
            <span className="text-xl">{essential.emoji}</span>
            <div>
              <p className="font-medium text-slate-800">{essential.item}</p>
              <p className="mt-0.5 text-sm text-slate-500">{essential.reason}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
