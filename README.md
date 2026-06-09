# ✈️ 여행갈때 뭐입지? (Travel Outfit Planner)

여행지와 여행 일정을 입력하면 **OpenWeather** 날씨 데이터와 **OpenAI** 분석을 결합해 맞춤 옷차림, 현지 스타일 팁, 준비물을 추천하는 웹 서비스입니다.

## 기술 스택

- **Frontend:** React 18+, TypeScript, Vite, Tailwind CSS
- **API:** Vercel Serverless Functions
- **External APIs:** OpenWeather API, OpenAI API
- **Deploy:** Vercel

## 주요 기능

1. 여행지 / 출발일 / 도착일 입력
2. OpenWeather 기반 날씨 조회 (평균·최고·최저 기온, 강수 확률)
3. GPT 기반 옷차림 추천 및 추천 이유
4. 현지 스타일 팁
5. 여행 준비물 추천

## 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env.example`을 참고해 Vercel 프로젝트 또는 로컬에 아래 변수를 설정하세요.

```bash
OPENAI_API_KEY=your_key
OPENWEATHER_API_KEY=your_key   # 선택 (없으면 Open-Meteo 사용)
```

- [OpenAI API Key 발급](https://platform.openai.com/api-keys)
- [OpenWeather API Key 발급](https://openweathermap.org/api) — **무료 가입 필요, 키 없이는 사용 불가**

### 3. 로컬 실행

API 라우트(`/api/plan`)를 함께 테스트하려면 Vercel CLI를 사용하세요.

```bash
npx vercel dev
```

프론트엔드만 실행하려면:

```bash
npm run dev
```

> `npm run dev`만 실행하면 API 호출은 동작하지 않습니다. 전체 기능 테스트는 `vercel dev`를 권장합니다.

### 4. 빌드

```bash
npm run build
```

## Vercel 배포

1. GitHub에 프로젝트를 push
2. [Vercel](https://vercel.com)에서 Import
3. Environment Variables에 `OPENAI_API_KEY` 추가 (`OPENWEATHER_API_KEY`는 선택)
4. Deploy

## 프로젝트 구조

```text
├── api/
│   └── plan.ts          # 날씨 조회 + AI 추천 API
├── src/
│   ├── api/client.ts    # API 클라이언트
│   ├── components/      # UI 컴포넌트
│   ├── types/           # TypeScript 타입
│   ├── App.tsx
│   └── main.tsx
├── vercel.json
└── vite.config.ts
```

## 날씨 데이터 안내

| 조건 | 사용 API |
|------|----------|
| OpenWeather 키 있음 + 5일 이내 | OpenWeather 실시간 예보 |
| 키 없음 + 16일 이내 | **Open-Meteo** 실시간 예보 (키 불필요) |
| 그 외 (먼 미래 등) | Open-Meteo 과거 동일 시기 평균 (예상) |

> **참고:** OpenWeather 공식 API는 모든 요청에 API 키가 필수입니다. 키 없이 날씨를 쓰려면 Open-Meteo가 자동으로 사용됩니다.

## 발표용 한 줄 소개

> "여행지와 여행 일정을 입력하면 날씨 데이터와 생성형 AI를 활용하여 현지 맞춤 옷차림과 준비물을 추천하는 여행 지원 웹 서비스입니다."
