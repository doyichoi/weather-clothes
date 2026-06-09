import { useMemo, useState } from 'react'
import { DayPicker, type DateRange } from 'react-day-picker'
import { ko } from 'date-fns/locale'
import {
  formatKoreanDate,
  getDateRangePresets,
  getTripNightCount,
  parseDateString,
  rangeToStrings,
  todayString,
} from '../lib/dates'
import 'react-day-picker/style.css'

interface DateRangePickerProps {
  startDate: string
  endDate: string
  onStartDateChange: (value: string) => void
  onEndDateChange: (value: string) => void
}

export default function DateRangePicker({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
}: DateRangePickerProps) {
  const [activePreset, setActivePreset] = useState<string | null>(null)

  const selectedRange = useMemo<DateRange | undefined>(() => {
    const from = parseDateString(startDate)
    const to = parseDateString(endDate)
    if (!from && !to) return undefined
    return { from, to }
  }, [startDate, endDate])

  const presets = getDateRangePresets()
  const today = parseDateString(todayString())!
  const nights = getTripNightCount(startDate, endDate)
  const hasCompleteRange = Boolean(startDate && endDate)

  const applyRange = (range: DateRange | undefined, presetLabel: string | null = null) => {
    const { startDate: nextStart, endDate: nextEnd } = rangeToStrings(range)
    onStartDateChange(nextStart)
    onEndDateChange(nextEnd)
    setActivePreset(presetLabel)
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="mb-2 text-sm font-medium text-slate-700">여행 기간</p>
        <div className="flex flex-wrap gap-2">
          {presets.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => {
                const { from, to } = preset.getRange()
                applyRange({ from, to }, preset.label)
              }}
              className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                activePreset === preset.label
                  ? 'bg-sky-600 text-white'
                  : 'bg-sky-50 text-sky-700 hover:bg-sky-100'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
        <div className="trip-calendar mx-auto flex justify-center">
          <DayPicker
            mode="range"
            locale={ko}
            numberOfMonths={1}
            selected={selectedRange}
            onSelect={(range) => applyRange(range)}
            disabled={{ before: today }}
            defaultMonth={selectedRange?.from ?? today}
            showOutsideDays
          />
        </div>
        <p className="mt-2 text-center text-xs text-slate-500">
          출발일을 먼저, 도착일을 다음에 선택하세요
        </p>
      </div>

      <div
        className={`rounded-xl px-4 py-3 text-sm ${
          hasCompleteRange ? 'bg-sky-50 text-sky-900' : 'bg-slate-100 text-slate-500'
        }`}
      >
        {hasCompleteRange ? (
          <>
            <p className="font-medium">
              {formatKoreanDate(startDate)} → {formatKoreanDate(endDate)}
            </p>
            <p className="mt-1 text-sky-700">
              {nights === 0 ? '당일치기' : `${nights}박 ${nights + 1}일`}
            </p>
          </>
        ) : startDate ? (
          <p>
            출발: <span className="font-medium">{formatKoreanDate(startDate)}</span>
            <span className="text-slate-500"> · 도착일을 선택해주세요</span>
          </p>
        ) : (
          <p>캘린더에서 날짜를 선택하거나 위 버튼을 눌러주세요</p>
        )}
      </div>
    </div>
  )
}
