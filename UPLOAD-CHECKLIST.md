# GitHub 업로드 체크리스트

## 📋 업로드 전 확인 사항

### ✅ 필수 파일 체크리스트:

#### 프로젝트 루트 파일
- [ ] `package.json`
- [ ] `package.json.deploy` ⭐
- [ ] `vite.config.ts` 
- [ ] `vite.config.deploy.ts` ⭐
- [ ] `tsconfig.json`
- [ ] `tailwind.config.ts`
- [ ] `postcss.config.js`
- [ ] `components.json`
- [ ] `drizzle.config.ts`

#### 배포 설정 파일
- [ ] `railway.toml` ⭐
- [ ] `nixpacks.toml` ⭐
- [ ] `.gitignore`

#### 소스 코드 폴더
- [ ] `client/` (전체)
- [ ] `server/` (전체)
- [ ] `shared/` (전체)

#### 문서 파일
- [ ] `README.md`
- [ ] `RAILWAY-DEPLOY-GUIDE.md` ⭐
- [ ] `replit.md`

### 🚫 업로드 금지 파일/폴더:
- [ ] `node_modules/` (제외)
- [ ] `dist/` (제외)
- [ ] `.env` (실제 값 포함된 경우 제외)
- [ ] `attached_assets/` (제외)

### 📝 .gitignore 파일 내용 확인:
```
node_modules/
dist/
.env
attached_assets/
*.log
.DS_Store
```

### 🎯 Railway 배포 준비 완료 체크:
- [ ] GitHub 저장소 생성됨
- [ ] 모든 필수 파일 업로드 완료
- [ ] Railway 계정 준비됨
- [ ] 환경변수 값 준비됨:
  - [ ] `DATABASE_URL` (Neon DB)
  - [ ] `EXCHANGE_API_KEY` (ExchangeRate API)
  - [ ] `NODE_ENV=production`
  - [ ] `KAKAO_CLIENT_ID` (선택사항)
  - [ ] `KAKAO_REDIRECT_URI` (선택사항)

### 🚀 배포 후 테스트 항목:
- [ ] 웹사이트 접속 가능
- [ ] USD/KRW 환율 표시
- [ ] JPY/KRW 환율 표시
- [ ] USD/JPY 환율 표시
- [ ] 알림 생성 기능
- [ ] 알림 삭제 기능
- [ ] 브라우저 알림 작동
- [ ] 카카오톡 알림 작동 (설정한 경우)
- [ ] 설정 변경 기능

### 📞 문제 해결:
빌드 실패 시 → `nixpacks.toml` 설정 확인
환율 데이터 오류 시 → `EXCHANGE_API_KEY` 확인
카카오 알림 오류 시 → 카카오 앱 설정 확인