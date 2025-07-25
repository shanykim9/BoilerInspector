# GitHub 배포 완벽 가이드

## 🚀 Railway 배포 방법 (추천 - 월 6,000원)

### 1단계: GitHub 저장소 생성
1. GitHub.com → New repository
2. 이름: `boiler-inspection-app`
3. Private 선택
4. Create repository

### 2단계: 코드 업로드
```bash
# Replit Shell에서 실행
git init
git add .
git commit -m "Boiler inspection app - initial commit"
git remote add origin https://github.com/[YOUR_USERNAME]/boiler-inspection-app.git
git push -u origin main
```

### 3단계: Railway 배포
1. railway.app 접속
2. "Deploy from GitHub repo" 클릭
3. GitHub 계정 연결
4. `boiler-inspection-app` 저장소 선택
5. "Deploy Now" 클릭

### 4단계: 데이터베이스 추가
1. Railway 대시보드에서 "Add PostgreSQL" 클릭
2. 자동으로 DATABASE_URL 환경변수 생성됨
3. 추가 환경변수 설정:
   - SESSION_SECRET: `random-secret-key-123456`
   - REPL_ID: `boiler-inspection-app`

### 5단계: 데이터베이스 스키마 적용
Railway 터미널에서:
```bash
npm run db:push
```

## 💰 비용 분석

### Railway (추천)
- **월 비용**: $5 (약 6,000원)
- **포함사항**: 앱 호스팅 + PostgreSQL + 500GB 대역폭
- **장점**: 설정 간단, 한 곳에서 관리

### Vercel + Neon
- **월 비용**: $0~39 (확장시)
- **무료 제한**: 트래픽 제한, DB 3GB
- **장점**: 초기 무료 테스트 가능

### DigitalOcean
- **월 비용**: $27 (약 32,000원)
- **장점**: 기업급 안정성
- **단점**: 설정 복잡, 비용 높음

## 🎯 추천 순서

1. **테스트 단계**: Vercel + Neon (무료)
2. **실제 운영**: Railway ($5/월)
3. **대규모 운영**: DigitalOcean ($27/월)

## 📊 실제 사용 시나리오별 비용

### 소규모 (10-50명)
- Railway: $5/월로 충분
- 예상 데이터: 1GB 미만
- 월 트래픽: 10GB 미만

### 중규모 (50-200명)
- Railway Pro: $20/월
- 예상 데이터: 5GB
- 월 트래픽: 100GB

### 대규모 (200명+)
- DigitalOcean: $50/월
- 별도 CDN 필요
- 전용 관리 필요

## 🔧 문제 해결

### 배포 실패시
1. package.json의 scripts 확인
2. 환경변수 올바른지 확인
3. DATABASE_URL 연결 테스트

### 데이터베이스 연결 오류
1. Neon/Railway DB 상태 확인
2. 방화벽 설정 확인
3. 연결 문자열 형식 확인

### 성능 이슈
1. 이미지 파일 크기 최적화
2. 불필요한 데이터 정리
3. 캐싱 설정 추가