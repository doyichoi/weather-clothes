export interface TripInput {
  city: string
  startDate: string
  endDate: string
}

export interface WeatherData {
  city: string
  country: string
  avgTemp: number
  minTemp: number
  maxTemp: number
  rainChance: number
  weatherStatus: string
  source: 'openweather' | 'open_meteo' | 'historical_estimate'
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
