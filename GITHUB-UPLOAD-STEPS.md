# 단계별 GitHub 업로드 가이드

## 🎯 추천 방법: Replit 전체 다운로드

### Step 1: Replit에서 다운로드
1. **Replit 화면 상단**의 점 3개 메뉴(...) 클릭
2. **"Download as zip"** 클릭  
3. **exchange-monitor.zip** 파일 다운로드

### Step 2: GitHub에 업로드
1. **GitHub 저장소 페이지**로 이동
2. **"Add file" → "Upload files"** 클릭
3. **다운로드한 zip 파일을 드래그&드롭**
4. **"Commit changes"** 클릭

## 🔄 대안 방법: 폴더별 업로드

### 필수 폴더 다운로드 순서:
1. `client` 폴더 우클릭 → Download
2. `server` 폴더 우클릭 → Download  
3. `shared` 폴더 우클릭 → Download

### 필수 파일 복사:
- package.json
- tsconfig.json
- vite.config.ts
- tailwind.config.ts
- railway.toml
- vercel.json
- .gitignore

## ⚡ 빠른 업로드 팁:

1. **압축 해제**: 다운로드한 zip을 압축 해제
2. **불필요한 파일 제거**: 
   - `.env` 파일 삭제 (보안)
   - `node_modules/` 폴더 삭제 (용량)
   - `dist/` 폴더 삭제 (빌드 파일)
3. **GitHub 업로드**: 남은 파일들을 GitHub에 드래그&드롭

## 🚀 업로드 완료 후:
✅ railway.app 접속  
✅ "Deploy from GitHub repo" 선택  
✅ 환경변수 설정  
✅ 자동 배포 시작