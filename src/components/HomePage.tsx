import DateRangePicker from './DateRangePicker'

interface HomePageProps {
  city: string
  startDate: string
  endDate: string
  loading: boolean
  error: string | null
  onCityChange: (value: string) => void
  onStartDateChange: (value: string) => void
  onEndDateChange: (value: string) => void
  onSubmit: () => void
}

export default function HomePage({
  city,
  startDate,
  endDate,
  loading,
  error,
  onCityChange,
  onStartDateChange,
  onEndDateChange,
  onSubmit,
}: HomePageProps) {
  const canSubmit = Boolean(city.trim() && startDate && endDate)

  return (
    <div className="mx-auto flex min-h-svh max-w-lg flex-col justify-center px-6 py-12">
      <header className="mb-10 text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-sky-100 px-4 py-1.5 text-sm font-medium text-sky-700">
          <span>✈️</span>
          <span>Travel Outfit Planner</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          여행갈때 뭐입지?
        </h1>
        <p className="mt-3 text-slate-600">
          한국 기온별 기준을 바탕으로,{' '}
          <strong className="font-semibold text-slate-800">현지인 옷차림</strong>을 추천해드려요
        </p>
      </header>

      <form
        className="rounded-2xl bg-white p-6 shadow-lg shadow-sky-100/60 ring-1 ring-sky-100"
        onSubmit={(event) => {
          event.preventDefault()
          if (canSubmit) onSubmit()
        }}
      >
        <div className="space-y-5">
          <div>
            <label htmlFor="city" className="mb-1.5 block text-sm font-medium text-slate-700">
              여행지
            </label>
            <input
              id="city"
              type="text"
              value={city}
              onChange={(event) => onCityChange(event.target.value)}
              placeholder="예: 도쿄, Tokyo, Paris"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
              required
            />
          </div>

          <DateRangePicker
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={onStartDateChange}
            onEndDateChange={onEndDateChange}
          />
        </div>

        {error && (
          <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading || !canSubmit}
          className="mt-6 w-full rounded-xl bg-sky-600 py-3.5 text-base font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? '코디 분석 중...' : '코디 추천받기 ✨'}
        </button>
      </form>
    </div>
  )
}
