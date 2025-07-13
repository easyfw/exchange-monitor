# GitHub 업로드 가이드

## 📁 업로드해야 할 폴더/파일:

### 필수 폴더:
- `client/` (전체 폴더)
- `server/` (전체 폴더) 
- `shared/` (전체 폴더)

### 필수 파일:
- `package.json`
- `package-lock.json`
- `tsconfig.json`
- `vite.config.ts`
- `tailwind.config.ts`
- `postcss.config.js`
- `components.json`
- `drizzle.config.ts`
- `vercel.json`
- `railway.toml`
- `nixpacks.toml`
- `.gitignore`
- `README.md`
- `replit.md`

### 제외할 파일/폴더:
- `node_modules/` (자동 제외)
- `.env` (보안상 제외)
- `dist/` (빌드 시 자동 생성)

## 🚀 GitHub 업로드 단계:

1. **GitHub 저장소 페이지**에서 "uploading an existing file" 클릭
2. **폴더 전체 선택** (client, server, shared 폴더와 모든 설정 파일)
3. **드래그&드롭**으로 업로드
4. **Commit message**: "Initial commit: Real-time exchange rate monitoring app"
5. **Commit changes** 클릭

## ⚡ Railway 배포:

GitHub 업로드 완료 후:
1. railway.app 접속
2. "Deploy from GitHub repo" 선택
3. exchange-monitor 저장소 연결
4. 환경변수 설정 후 자동 배포