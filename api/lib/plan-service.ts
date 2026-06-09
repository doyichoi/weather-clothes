import OpenAI from 'openai'
import {
  formatKoreanBaselineSummary,
  getKoreanBaselineOutfits,
  KOREAN_TEMP_OUTFIT_GUIDE,
} from './korean-temp-guide'

export interface TripInput {
  city: string
  startDate: string
  endDate: string
}

export type WeatherSource = 'openweather' | 'open_meteo' | 'historical_estimate'

export interface WeatherData {
  city: string
  country: string
  avgTemp: number
  minTemp: number
  maxTemp: number
  rainChance: number
  weatherStatus: string
  source: WeatherSource
  month: number
  tripDays: number
  tempSpread: number
}

export interface OutfitLayer {
  category: string
  emoji: string
  item: string
  detail: string
}

export interface TimeGuide {
  period: string
  outfit: string
  note: string
}

export interface EssentialItem {
  emoji: string
  item: string
  reason: string
}

export interface LocalComparison {
  koreanStandard: string
  localReality: string
  keyDifference: string
}

export interface Recommendation {
  completeLook: string
  layers: OutfitLayer[]
  timeGuide: TimeGuide[]
  reason: string
  avoidItems: string[]
  koreanBaseline: string
  localComparison: LocalComparison
  localTips: string[]
  essentials: EssentialItem[]
}

export interface PlanResult {
  weather: WeatherData
  recommendation: Recommendation
}

interface DailyWeather {
  date: string
  min: number
  max: number
  rainChance: number
  description: string
}

interface GeoResult {
  lat: number
  lon: number
  name: string
  country: string
}

interface PlanEnv {
  OPENWEATHER_API_KEY?: string
  OPENAI_API_KEY?: string
}

const WEATHER_DESCRIPTIONS: Record<number, string> = {
  0: '맑음',
  1: '대체로 맑음',
  2: '부분적으로 흐림',
  3: '흐림',
  45: '안개',
  48: '안개',
  51: '이슬비',
  53: '이슬비',
  55: '이슬비',
  61: '비',
  63: '비',
  65: '폭우',
  71: '눈',
  73: '눈',
  75: '폭설',
  80: '소나기',
  81: '소나기',
  82: '폭우',
  95: '뇌우',
}

function parseDate(dateStr: string): Date {
  return new Date(`${dateStr}T00:00:00`)
}

function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10)
}

function shiftYear(dateStr: string, years: number): string {
  const date = parseDate(dateStr)
  date.setFullYear(date.getFullYear() + years)
  return formatDate(date)
}

function enumerateDates(startDate: string, endDate: string): string[] {
  const dates: string[] = []
  const current = parseDate(startDate)
  const end = parseDate(endDate)

  while (current <= end) {
    dates.push(formatDate(current))
    current.setDate(current.getDate() + 1)
  }

  return dates
}

function round(value: number): number {
  return Math.round(value * 10) / 10
}

function average(values: number[]): number {
  if (values.length === 0) return 0
  return values.reduce((sum, value) => sum + value, 0) / values.length
}

function mostCommon(values: string[]): string {
  if (values.length === 0) return '정보 없음'

  const counts = new Map<string, number>()
  for (const value of values) {
    counts.set(value, (counts.get(value) ?? 0) + 1)
  }

  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0]
}

function parseDailyMeteoResponse(data: {
  daily: {
    time: string[]
    temperature_2m_max: number[]
    temperature_2m_min: number[]
    precipitation_probability_max: number[]
    weathercode: number[]
  }
}): DailyWeather[] {
  return data.daily.time.map((date, index) => ({
    date,
    min: data.daily.temperature_2m_min[index],
    max: data.daily.temperature_2m_max[index],
    rainChance: Math.round(data.daily.precipitation_probability_max[index] ?? 0),
    description: WEATHER_DESCRIPTIONS[data.daily.weathercode[index]] ?? '정보 없음',
  }))
}

function filterDailyByTrip(
  dailyData: DailyWeather[],
  startDate: string,
  endDate: string,
): DailyWeather[] {
  const tripDates = new Set(enumerateDates(startDate, endDate))
  return dailyData.filter((day) => tripDates.has(day.date))
}

async function geocodeCityOpenMeteo(city: string): Promise<GeoResult> {
  const url = new URL('https://geocoding-api.open-meteo.com/v1/search')
  url.searchParams.set('name', city)
  url.searchParams.set('count', '1')
  url.searchParams.set('language', 'ko')
  url.searchParams.set('format', 'json')

  const response = await fetch(url)
  if (!response.ok) {
    throw new Error('여행지 정보를 불러오지 못했습니다.')
  }

  const data = (await response.json()) as {
    results?: Array<{
      latitude: number
      longitude: number
      name: string
      country: string
    }>
  }

  if (!data.results?.length) {
    throw new Error('여행지를 찾을 수 없습니다. 도시 이름을 다시 확인해주세요.')
  }

  const result = data.results[0]
  return {
    lat: result.latitude,
    lon: result.longitude,
    name: result.name,
    country: result.country,
  }
}

async function fetchOpenMeteoForecast(
  lat: number,
  lon: number,
  startDate: string,
  endDate: string,
): Promise<DailyWeather[]> {
  const url = new URL('https://api.open-meteo.com/v1/forecast')
  url.searchParams.set('latitude', String(lat))
  url.searchParams.set('longitude', String(lon))
  url.searchParams.set('start_date', startDate)
  url.searchParams.set('end_date', endDate)
  url.searchParams.set(
    'daily',
    'temperature_2m_max,temperature_2m_min,precipitation_probability_max,weathercode',
  )
  url.searchParams.set('timezone', 'auto')

  const response = await fetch(url)
  if (!response.ok) {
    throw new Error('날씨 예보를 불러오지 못했습니다.')
  }

  const data = (await response.json()) as {
    daily: {
      time: string[]
      temperature_2m_max: number[]
      temperature_2m_min: number[]
      precipitation_probability_max: number[]
      weathercode: number[]
    }
  }

  return parseDailyMeteoResponse(data)
}

async function fetchOpenWeatherForecast(
  lat: number,
  lon: number,
  startDate: string,
  endDate: string,
  apiKey: string,
): Promise<DailyWeather[]> {
  const url = new URL('https://api.openweathermap.org/data/2.5/forecast')
  url.searchParams.set('lat', String(lat))
  url.searchParams.set('lon', String(lon))
  url.searchParams.set('appid', apiKey)
  url.searchParams.set('units', 'metric')
  url.searchParams.set('lang', 'kr')

  const response = await fetch(url)
  if (!response.ok) {
    throw new Error('OpenWeather 예보를 불러오지 못했습니다.')
  }

  const data = (await response.json()) as {
    list: Array<{
      dt_txt: string
      main: { temp_min: number; temp_max: number }
      pop: number
      weather: Array<{ description: string }>
    }>
  }

  const tripDates = new Set(enumerateDates(startDate, endDate))
  const dailyMap = new Map<string, DailyWeather>()

  for (const entry of data.list) {
    const date = entry.dt_txt.slice(0, 10)
    if (!tripDates.has(date)) continue

    const existing = dailyMap.get(date)
    const rainChance = Math.round(entry.pop * 100)
    const description = entry.weather[0]?.description ?? '정보 없음'

    if (!existing) {
      dailyMap.set(date, {
        date,
        min: entry.main.temp_min,
        max: entry.main.temp_max,
        rainChance,
        description,
      })
      continue
    }

    existing.min = Math.min(existing.min, entry.main.temp_min)
    existing.max = Math.max(existing.max, entry.main.temp_max)
    existing.rainChance = Math.max(existing.rainChance, rainChance)
    existing.description = description
  }

  return [...dailyMap.values()].sort((a, b) => a.date.localeCompare(b.date))
}

async function fetchHistoricalEstimate(
  lat: number,
  lon: number,
  startDate: string,
  endDate: string,
): Promise<DailyWeather[]> {
  const historicalStart = shiftYear(startDate, -1)
  const historicalEnd = shiftYear(endDate, -1)

  const url = new URL('https://archive-api.open-meteo.com/v1/archive')
  url.searchParams.set('latitude', String(lat))
  url.searchParams.set('longitude', String(lon))
  url.searchParams.set('start_date', historicalStart)
  url.searchParams.set('end_date', historicalEnd)
  url.searchParams.set(
    'daily',
    'temperature_2m_max,temperature_2m_min,precipitation_probability_max,weathercode',
  )
  url.searchParams.set('timezone', 'auto')

  const response = await fetch(url)
  if (!response.ok) {
    throw new Error('과거 기상 데이터를 불러오지 못했습니다.')
  }

  const data = (await response.json()) as {
    daily: {
      time: string[]
      temperature_2m_max: number[]
      temperature_2m_min: number[]
      precipitation_probability_max: number[]
      weathercode: number[]
    }
  }

  return parseDailyMeteoResponse(data)
}

function summarizeWeather(
  city: string,
  country: string,
  dailyData: DailyWeather[],
  source: WeatherSource,
  month: number,
  tripDays: number,
): WeatherData {
  const mins = dailyData.map((day) => day.min)
  const maxs = dailyData.map((day) => day.max)
  const avgTemps = dailyData.map((day) => (day.min + day.max) / 2)
  const minTemp = round(Math.min(...mins))
  const maxTemp = round(Math.max(...maxs))

  return {
    city,
    country,
    avgTemp: round(average(avgTemps)),
    minTemp,
    maxTemp,
    rainChance: Math.round(average(dailyData.map((day) => day.rainChance))),
    weatherStatus: mostCommon(dailyData.map((day) => day.description)),
    source,
    month,
    tripDays,
    tempSpread: round(maxTemp - minTemp),
  }
}

function getWeatherSourceLabel(source: WeatherSource): string {
  switch (source) {
    case 'openweather':
      return 'OpenWeather 실시간 예보'
    case 'open_meteo':
      return 'Open-Meteo 실시간 예보 (API 키 불필요)'
    case 'historical_estimate':
      return '과거 동일 시기 평균 기온 (예상)'
  }
}

async function getWeather(
  city: string,
  startDate: string,
  endDate: string,
  openWeatherKey?: string,
): Promise<WeatherData> {
  const geo = await geocodeCityOpenMeteo(city)
  const start = parseDate(startDate)
  const end = parseDate(endDate)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  if (end < start) {
    throw new Error('도착일은 출발일 이후여야 합니다.')
  }

  const daysUntilStart = (start.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  const daysUntilEnd = (end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  const tripDayCount = enumerateDates(startDate, endDate).length

  let dailyData: DailyWeather[] = []
  let source: WeatherSource = 'open_meteo'

  if (openWeatherKey && daysUntilStart >= 0 && daysUntilEnd <= 5) {
    try {
      dailyData = await fetchOpenWeatherForecast(
        geo.lat,
        geo.lon,
        startDate,
        endDate,
        openWeatherKey,
      )
      if (dailyData.length > 0) {
        source = 'openweather'
      }
    } catch {
      dailyData = []
    }
  }

  if (dailyData.length === 0 && daysUntilStart >= 0 && daysUntilEnd <= 15) {
    dailyData = filterDailyByTrip(
      await fetchOpenMeteoForecast(geo.lat, geo.lon, startDate, endDate),
      startDate,
      endDate,
    )
    source = 'open_meteo'
  }

  if (dailyData.length < tripDayCount) {
    dailyData = await fetchHistoricalEstimate(geo.lat, geo.lon, startDate, endDate)
    source = 'historical_estimate'
  }

  if (dailyData.length === 0) {
    throw new Error('해당 기간의 날씨 정보를 찾을 수 없습니다.')
  }

  return summarizeWeather(
    geo.name,
    geo.country,
    dailyData,
    source,
    start.getMonth() + 1,
    tripDayCount,
  )
}

function normalizeRecommendation(
  raw: Partial<Recommendation>,
  koreanBaseline: string,
): Recommendation {
  return {
    completeLook: raw.completeLook ?? '날씨에 맞는 레이어드 코디를 준비하세요.',
    layers: raw.layers?.length
      ? raw.layers
      : [{ category: '상의', emoji: '👕', item: '기본 상의', detail: '날씨에 맞게 조절' }],
    timeGuide: raw.timeGuide?.length
      ? raw.timeGuide
      : [{ period: '하루 종일', outfit: '레이어드 코디', note: '일교차 대비' }],
    reason: raw.reason ?? '현지 기온과 한국 기온별 기준을 고려한 추천입니다.',
    avoidItems: raw.avoidItems?.length ? raw.avoidItems : [],
    koreanBaseline,
    localComparison: {
      koreanStandard: raw.localComparison?.koreanStandard ?? koreanBaseline,
      localReality:
        raw.localComparison?.localReality ??
        '현지인들은 같은 기온에서도 현지 날씨 습도·바람·실내 온도에 맞게 입습니다.',
      keyDifference:
        raw.localComparison?.keyDifference ??
        '한국 기준과 현지 체감 온도, 실내 난방/냉방 문화 차이를 확인하세요.',
    },
    localTips: raw.localTips?.length ? raw.localTips : [],
    essentials: raw.essentials?.length
      ? raw.essentials.map((item) => ({
          emoji: item.emoji ?? '🎒',
          item: item.item ?? '준비물',
          reason: item.reason ?? '여행에 유용',
        }))
      : [{ emoji: '☂️', item: '우산', reason: '강수 대비' }],
  }
}

async function getRecommendation(
  weather: WeatherData,
  trip: { startDate: string; endDate: string },
  openAiKey: string,
): Promise<Recommendation> {
  const openai = new OpenAI({ apiKey: openAiKey })
  const layeringNeeded = weather.tempSpread >= 8
  const koreanBaselineData = getKoreanBaselineOutfits(
    weather.avgTemp,
    weather.minTemp,
    weather.maxTemp,
  )
  const koreanBaseline = formatKoreanBaselineSummary(koreanBaselineData)

  const koreanGuideReference = KOREAN_TEMP_OUTFIT_GUIDE.map(
    (item) => `${item.range}: ${item.outfit}`,
  ).join('\n')

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    temperature: 0.5,
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content: `당신은 한국인 여행자를 위한 현지 패션 가이드입니다.

핵심 접근법:
1. 먼저 "한국 기온별 옷차림 기준"을 출발점으로 삼습니다.
2. 그다음 해당 도시 현지인이 같은 기온에서 실제로 무엇을 입는지 설명합니다.
3. 한국 기준과 현지의 차이(습도, 바람, 실내 난방/냉방, 지하철, 현지 패션 문화)를 명확히 짚습니다.
4. 준비물은 "한국에서 챙기던 것 vs 현지에서 필요한 것" 차이를 반영합니다.

한국 기온별 옷차림 기준표:
${koreanGuideReference}

반드시 아래 JSON 형식으로만 응답:
{
  "completeLook": "현지인 스타일을 반영한 완성 코디 한 문장",
  "layers": [
    { "category": "겉옷", "emoji": "🧥", "item": "구체적 아이템", "detail": "현지에서 이 기온에 입는 이유" }
  ],
  "timeGuide": [
    { "period": "아침·저녁", "outfit": "현지식 코디", "note": "한국 기준과 비교한 체감 설명" }
  ],
  "reason": "한국 기준 대비 왜 이렇게 입어야 하는지 3~4문장",
  "avoidItems": ["한국 기준으로 챙기면 현지에서 불편한 옷 2~3가지"],
  "localComparison": {
    "koreanStandard": "이 기온에서 한국인이 보통 입는 옷 (기준표 기반)",
    "localReality": "해당 도시 현지인이 이 기온에 실제로 입는 옷과 스타일",
    "keyDifference": "한국과 현지의 핵심 차이 1~2문장 (실내온도, 습도, 바람, 패션문화)"
  },
  "localTips": [
    "현지인 옷차림 팁 3~4개 (지하철, 카페, 관광지, 쇼핑 등)",
    "예: 도쿄 12월엔 경량 패딩+히트텍, 실내 난방 강해 레이어드 필수"
  ],
  "essentials": [
    { "emoji": "☂️", "item": "준비물", "reason": "한국 기준과 달리 현지에서 특히 필요한 이유" }
  ]
}

layers 4~6개, timeGuide 2~3개, localTips 3~4개, essentials 3~5개.`,
      },
      {
        role: 'user',
        content: JSON.stringify({
          destination: `${weather.city}, ${weather.country}`,
          tripPeriod: `${trip.startDate} ~ ${trip.endDate} (${weather.tripDays}일)`,
          month: weather.month,
          avgTemp: weather.avgTemp,
          minTemp: weather.minTemp,
          maxTemp: weather.maxTemp,
          tempSpread: weather.tempSpread,
          layeringNeeded,
          rainChance: weather.rainChance,
          weatherStatus: weather.weatherStatus,
          koreanBaselineForThisTrip: koreanBaselineData,
          koreanBaselineSummary: koreanBaseline,
          dataSource: getWeatherSourceLabel(weather.source),
        }),
      },
    ],
  })

  const content = completion.choices[0]?.message?.content
  if (!content) {
    throw new Error('AI 추천을 생성하지 못했습니다.')
  }

  return normalizeRecommendation(JSON.parse(content) as Partial<Recommendation>, koreanBaseline)
}

export async function createTravelPlan(input: TripInput, env: PlanEnv): Promise<PlanResult> {
  const openAiKey = env.OPENAI_API_KEY?.trim()

  if (!openAiKey || openAiKey === 'your_openai_api_key') {
    throw new Error('OPENAI_API_KEY가 설정되지 않았습니다. Vercel Environment Variables를 확인해주세요.')
  }

  const { city, startDate, endDate } = input

  if (!city.trim() || !startDate || !endDate) {
    throw new Error('여행지, 출발일, 도착일을 모두 입력해주세요.')
  }

  const weather = await getWeather(
    city.trim(),
    startDate,
    endDate,
    env.OPENWEATHER_API_KEY?.trim() || undefined,
  )
  const recommendation = await getRecommendation(weather, { startDate, endDate }, openAiKey)

  return { weather, recommendation }
}
