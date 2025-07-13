# Vercel 배포 가이드

## 🚀 단계별 배포 방법

### 1. Vercel CLI 설치
```bash
npm install -g vercel
```

### 2. 로그인
```bash
vercel login
```

### 3. 프로젝트 배포
```bash
vercel
```

### 4. 필수 환경변수 설정
Vercel 대시보드에서 다음 환경변수를 추가하세요:

```bash
# 데이터베이스 (Neon, Supabase 등)
DATABASE_URL=postgresql://username:password@host:port/database

# 환율 API (exchangerate-api.com)
EXCHANGE_API_KEY=your_api_key

# 카카오톡 알림 (선택사항)
KAKAO_CLIENT_ID=your_kakao_client_id
KAKAO_REDIRECT_URI=https://your-app.vercel.app/api/kakao/callback
```

### 5. 프로덕션 배포
```bash
vercel --prod
```

## 📋 체크리스트

- [ ] PostgreSQL 데이터베이스 준비 (Neon/Supabase)
- [ ] ExchangeRate API 키 발급
- [ ] Vercel 환경변수 설정
- [ ] 카카오톡 앱 등록 (선택사항)
- [ ] 도메인 연결 (선택사항)

## 🔧 빌드 정보

- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Node.js Version**: 18+
- **Function Timeout**: 30초

## 📱 기능

- 실시간 환율 모니터링 (USD/KRW, JPY/KRW, USD/JPY)
- 가격 알림 시스템
- 카카오톡 푸시 알림
- 반응형 웹 디자인
- PWA 지원

## 🛠️ 문제 해결

### 데이터베이스 연결 오류
- DATABASE_URL 환경변수 확인
- 데이터베이스 접근 권한 확인

### 환율 데이터 로딩 실패
- EXCHANGE_API_KEY 확인
- API 할당량 확인

### 카카오톡 알림 실패
- KAKAO_CLIENT_ID, KAKAO_REDIRECT_URI 확인
- 카카오 개발자 콘솔에서 도메인 등록 확인