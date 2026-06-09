import {
  addDays,
  format,
  nextSaturday,
  nextSunday,
  parseISO,
  startOfDay,
} from 'date-fns'
import { ko } from 'date-fns/locale'

export function toDateString(date: Date): string {
  return format(date, 'yyyy-MM-dd')
}

export function parseDateString(value: string): Date | undefined {
  if (!value) return undefined
  return parseISO(value)
}

export function formatKoreanDate(value: string): string {
  const date = parseDateString(value)
  if (!date) return ''
  return format(date, 'M월 d일 (EEE)', { locale: ko })
}

export function getTripNightCount(startDate: string, endDate: string): number {
  const start = parseDateString(startDate)
  const end = parseDateString(endDate)
  if (!start || !end) return 0
  return Math.max(0, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)))
}

export function todayString(): string {
  return toDateString(startOfDay(new Date()))
}

export interface DateRangePreset {
  label: string
  getRange: () => { from: Date; to: Date }
}

export function getDateRangePresets(): DateRangePreset[] {
  const today = startOfDay(new Date())

  return [
    {
      label: '이번 주말',
      getRange: () => {
        const saturday = nextSaturday(today)
        const sunday = nextSunday(saturday)
        return { from: saturday, to: sunday }
      },
    },
    {
      label: '2박 3일',
      getRange: () => {
        const from = addDays(today, 7)
        return { from, to: addDays(from, 2) }
      },
    },
    {
      label: '3박 4일',
      getRange: () => {
        const from = addDays(today, 7)
        return { from, to: addDays(from, 3) }
      },
    },
    {
      label: '1주일',
      getRange: () => {
        const from = addDays(today, 14)
        return { from, to: addDays(from, 6) }
      },
    },
  ]
}

export function rangeToStrings(range: { from?: Date; to?: Date } | undefined): {
  startDate: string
  endDate: string
} {
  return {
    startDate: range?.from ? toDateString(range.from) : '',
    endDate: range?.to ? toDateString(range.to) : '',
  }
}
