export interface KoreanTempGuide {
  range: string
  min: number
  max: number
  outfit: string
}

/** 한국에서 통용되는 기온별 옷차림 기준 */
export const KOREAN_TEMP_OUTFIT_GUIDE: KoreanTempGuide[] = [
  { range: '28°C~', min: 28, max: 100, outfit: '민소매, 반팔, 반바지, 원피스' },
  { range: '23~27°C', min: 23, max: 27, outfit: '반팔, 얇은 셔츠, 반바지, 면바지' },
  { range: '20~22°C', min: 20, max: 22, outfit: '얇은 가디건, 긴팔, 면바지, 청바지' },
  { range: '17~19°C', min: 17, max: 19, outfit: '얇은 니트, 맨투맨, 가디건, 청바지' },
  { range: '12~16°C', min: 12, max: 16, outfit: '자켓, 가디건, 야상, 니트, 청바지, 면바지' },
  { range: '9~11°C', min: 9, max: 11, outfit: '자켓, 트렌치, 야상, 니트, 청바지, 스타킹' },
  { range: '5~8°C', min: 5, max: 8, outfit: '코트, 가죽자켓, 기모/히트텍, 니트, 레깅스' },
  { range: '4°C~', min: -100, max: 4, outfit: '패딩, 두꺼운 코트, 목도리, 기모/히트텍 제품' },
]

export function getKoreanOutfitByTemp(temp: number): KoreanTempGuide {
  const guide = KOREAN_TEMP_OUTFIT_GUIDE.find((item) => temp >= item.min && temp <= item.max)
  return guide ?? KOREAN_TEMP_OUTFIT_GUIDE[KOREAN_TEMP_OUTFIT_GUIDE.length - 1]
}

export interface KoreanBaselineOutfits {
  avg: { temp: number; range: string; outfit: string }
  min: { temp: number; range: string; outfit: string }
  max: { temp: number; range: string; outfit: string }
}

export function getKoreanBaselineOutfits(
  avgTemp: number,
  minTemp: number,
  maxTemp: number,
): KoreanBaselineOutfits {
  const avg = getKoreanOutfitByTemp(Math.round(avgTemp))
  const min = getKoreanOutfitByTemp(Math.round(minTemp))
  const max = getKoreanOutfitByTemp(Math.round(maxTemp))

  return {
    avg: { temp: Math.round(avgTemp), range: avg.range, outfit: avg.outfit },
    min: { temp: Math.round(minTemp), range: min.range, outfit: min.outfit },
    max: { temp: Math.round(maxTemp), range: max.range, outfit: max.outfit },
  }
}

export function formatKoreanBaselineSummary(baseline: KoreanBaselineOutfits): string {
  const sameRange = baseline.min.range === baseline.max.range

  if (sameRange) {
    return `한국 기준 ${baseline.avg.temp}°C(${baseline.avg.range}): ${baseline.avg.outfit}`
  }

  return [
    `아침·저녁 ${baseline.min.temp}°C(${baseline.min.range}): ${baseline.min.outfit}`,
    `낮 ${baseline.max.temp}°C(${baseline.max.range}): ${baseline.max.outfit}`,
  ].join(' / ')
}
