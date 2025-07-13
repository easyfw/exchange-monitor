# Exchange Monitor - Real-time Currency Tracking PWA

실시간 환율 모니터링과 푸시 알림을 제공하는 Progressive Web App입니다.

## 주요 기능

### 📊 실시간 환율 데이터
- USD/KRW, JPY/KRW, USD/JPY 환율 실시간 추적
- Daum Finance, Investing.com에서 정확한 데이터 수집
- 30초마다 자동 업데이트
- 변동률 및 변동폭 표시

### 🔔 스마트 알림 시스템
- 사용자 정의 가격 알림 설정
- 목표 가격 도달 시 브라우저 푸시 알림
- KakaoTalk 메시지 연동 (OAuth 2.0)
- 활성/비활성 알림 관리

### 📱 PWA (Progressive Web App)
- 스마트폰 홈 화면 설치 가능
- 오프라인 지원 (Service Worker)
- 네이티브 앱과 같은 사용자 경험
- 반응형 모바일 최적화 디자인

### 📈 데이터 시각화
- 환율 변동 히스토리 차트
- 실시간 업데이트 상태 표시
- 직관적인 카드 기반 UI

## 기술 스택

### Frontend
- **React 18** + TypeScript
- **Vite** - 빠른 개발 서버
- **shadcn/ui** - 모던 UI 컴포넌트
- **Tailwind CSS** - 유틸리티 퍼스트 스타일링
- **TanStack Query** - 서버 상태 관리
- **Wouter** - 경량 라우팅

### Backend
- **Node.js** + Express.js
- **PostgreSQL** + Drizzle ORM
- **TypeScript** - 타입 안전성
- **Web Scraping** - 실시간 환율 데이터 수집

### PWA 기능
- **Service Worker** - 오프라인 지원
- **Web App Manifest** - 설치 가능한 앱
- **Push Notifications** - 브라우저 알림

## 설치 및 실행

### 1. 프로젝트 클론
```bash
git clone https://github.com/your-username/exchange-monitor.git
cd exchange-monitor
```

### 2. 의존성 설치
```bash
npm install
```

### 3. 환경 변수 설정
```bash
cp .env.example .env
```

필요한 환경 변수:
- `DATABASE_URL` - PostgreSQL 연결 URL
- `EXCHANGE_API_KEY` - 환율 API 키 (백업용)
- `KAKAO_CLIENT_ID` - KakaoTalk OAuth 클라이언트 ID
- `KAKAO_REDIRECT_URI` - OAuth 리다이렉트 URI

### 4. 데이터베이스 설정
```bash
npm run db:push
```

### 5. 개발 서버 실행
```bash
npm run dev
```

앱이 `http://localhost:5000`에서 실행됩니다.

## 배포

### Vercel 배포
```bash
vercel --prod
```

### Netlify 배포
```bash
netlify deploy --prod
```

## PWA 설치 방법

### 모바일 (Android/iOS)
1. 브라우저에서 앱 접속
2. 브라우저 메뉴에서 "홈 화면에 추가" 선택
3. 설치 완료 후 홈 화면에서 앱 실행

### 데스크톱 (Chrome/Edge)
1. 브라우저 주소창 옆 설치 아이콘 클릭
2. "설치" 버튼 클릭
3. 데스크톱 앱으로 실행 가능

## 주요 구조

```
exchange-monitor/
├── client/                 # Frontend 소스
│   ├── src/
│   │   ├── components/     # React 컴포넌트
│   │   ├── hooks/         # 커스텀 훅
│   │   ├── lib/           # 유틸리티
│   │   └── pages/         # 페이지 컴포넌트
│   ├── manifest.json      # PWA 매니페스트
│   └── sw.js             # Service Worker
├── server/                # Backend 소스
│   ├── routes.ts         # API 라우트
│   ├── storage.ts        # 데이터베이스 인터페이스
│   └── kakao-service.ts  # KakaoTalk 연동
└── shared/
    └── schema.ts         # 공유 타입 정의
```

## 라이선스

MIT License

## 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request