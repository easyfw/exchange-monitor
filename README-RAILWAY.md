# Railway 배포 가이드

## 🚀 Railway.app 배포 단계

### 1. GitHub 업로드
먼저 코드를 GitHub에 업로드하세요:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <your-github-repo-url>
git push -u origin main
```

### 2. Railway 프로젝트 생성
1. **railway.app** 방문
2. "Start a New Project" 클릭
3. "Deploy from GitHub repo" 선택
4. 저장소 선택 (exchange-monitor)

### 3. 환경변수 설정
Railway 대시보드에서 다음 환경변수를 설정하세요:

```
DATABASE_URL=postgresql://neondb_owner:npg_ZeCDA7n1Yfud@ep-snowy-dust-ad16d33f-pooler.c-2.us-east-1.aws.neon.tech/neondb
EXCHANGE_API_KEY=<your-exchange-api-key>
KAKAO_CLIENT_ID=<your-kakao-client-id>
KAKAO_REDIRECT_URI=<your-kakao-redirect-uri>
NODE_ENV=production
```

### 4. 자동 배포
- Railway가 자동으로 빌드하고 배포합니다
- 빌드 로그를 확인하여 진행상황을 모니터링하세요
- 배포 완료 후 제공된 URL로 접속 가능합니다

### 5. 도메인 설정 (선택사항)
- Railway 대시보드에서 커스텀 도메인 연결 가능
- SSL 인증서 자동 제공

## 📋 배포 확인사항
✅ Node.js 런타임 감지됨  
✅ npm install 자동 실행  
✅ npm run build 자동 실행  
✅ npm start로 서버 시작  
✅ 환경변수 설정 완료  
✅ PostgreSQL 데이터베이스 연결  

## 🔧 문제 해결
- 빌드 실패 시: Railway 로그 확인
- 환경변수 누락 시: Variables 탭에서 추가
- 데이터베이스 연결 실패 시: DATABASE_URL 확인