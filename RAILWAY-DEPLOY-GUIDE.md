# Railway 배포 가이드

## 🚀 Railway 배포 단계별 가이드

### 1. Railway 프로젝트 생성
- Railway.app 접속 후 로그인
- "New Project" → "Deploy from GitHub repo" 선택
- 이 저장소 선택

### 2. 환경변수 설정 (필수)
Railway 대시보드에서 Variables 탭에 다음 환경변수 추가:

```
DATABASE_URL=postgresql://neondb_owner:npg_ZeCDA7n1Yfud@ep-snowy-dust-ad16d33f-pooler.c-2.us-east-1.aws.neon.tech/neondb
EXCHANGE_API_KEY=your_exchange_api_key
NODE_ENV=production
```

### 3. 선택사항 - 카카오톡 알림 활성화
카카오톡 알림을 원하는 경우 추가:
```
KAKAO_CLIENT_ID=your_kakao_client_id
KAKAO_REDIRECT_URI=https://your-app.railway.app/api/kakao/callback
```

### 4. 배포 설정
- Build Command: 자동으로 `npm run build` 실행
- Start Command: 자동으로 `npm start` 실행
- Health Check: `/api/rates` 엔드포인트 체크

### 5. 배포 확인
배포 성공 후 제공되는 도메인으로 접속하여 다음 확인:
- ✅ 실시간 환율 데이터 표시
- ✅ 알림 생성/삭제 기능
- ✅ 브라우저 알림 작동
- ✅ 카카오톡 알림 (설정한 경우)

## 🔧 문제 해결

### 빌드 실패 시
1. nixpacks.toml 설정 확인
2. package.json.deploy 파일 존재 확인
3. vite.config.deploy.ts 파일 존재 확인

### 환율 데이터 오류 시
- EXCHANGE_API_KEY 확인
- 웹 스크래핑 소스 접근 가능성 확인

### 카카오톡 알림 오류 시
- KAKAO_CLIENT_ID 값 확인
- KAKAO_REDIRECT_URI 도메인 일치 확인
- 카카오 개발자 앱 설정 확인

## 📊 기능 확인 체크리스트
- [ ] USD/KRW 실시간 환율 표시
- [ ] JPY/KRW 실시간 환율 표시  
- [ ] USD/JPY 계산된 환율 표시
- [ ] 알림 생성 및 삭제 기능
- [ ] 브라우저 알림 발송
- [ ] 카카오톡 알림 발송 (선택)
- [ ] 설정 변경 (업데이트 주기 등)