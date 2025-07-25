# 150명 사용자를 위한 저렴한 배포 가이드

## 💰 비용 최적화 방안 (월 0-30,000원)

### 🥇 최저비용: Vercel + PlanetScale
- **Vercel**: 무료 (Hobby) → Pro $20/월 (필요시)
- **PlanetScale**: 무료 (5GB) → Scale $29/월 (필요시)
- **초기 비용**: $0/월
- **확장 시**: $20-49/월

### 🥈 중간비용: Railway
- **Railway**: $5/월 (스타터) → $20/월 (Pro)
- **PostgreSQL**: 포함
- **총 비용**: $5-20/월

### 🥉 안정적: Render + Neon
- **Render**: $7/월 (Web Service)
- **Neon**: 무료 (3GB) → $19/월 (Pro)
- **총 비용**: $7-26/월

## 🚀 단계별 구현: PlanetScale + Vercel (추천)

### 1단계: GitHub 저장소 준비
```bash
# Replit Shell에서 실행
git init
git add .
git commit -m "Boiler inspection app for 150 users"
git remote add origin https://github.com/[USERNAME]/boiler-inspection-app.git
git push -u origin main
```

### 2단계: PlanetScale 데이터베이스 설정
1. **planetscale.com 회원가입**
2. **새 데이터베이스 생성**
   - 이름: `boiler-inspection`
   - 지역: `ap-northeast` (아시아 태평양)
3. **연결 정보 생성**
   - "Connect" → "Create password"
   - 연결 문자열 복사

### 3단계: 스키마를 MySQL 호환으로 수정
PlanetScale은 MySQL이므로 PostgreSQL 코드를 수정해야 합니다.

### 4단계: Vercel 배포
1. **vercel.com 회원가입**
2. **GitHub 저장소 연결**
3. **환경변수 설정**
4. **자동 배포**

### 5단계: 성능 모니터링
- Vercel Analytics 활용
- PlanetScale Insights 모니터링
- 사용량 기반 확장 계획

## 📊 150명 사용자 예상 사용량

### 데이터 사용량 예측
- **점검 기록**: 150명 × 월 4회 = 600건/월
- **사진 업로드**: 600건 × 평균 3장 × 2MB = 3.6GB/월
- **데이터베이스**: 텍스트 데이터 50MB/월
- **총 스토리지**: 약 4GB/월

### 트래픽 예측
- **DAU**: 50명 (일일 활성 사용자)
- **페이지뷰**: 1,000회/일
- **API 호출**: 5,000회/일
- **월 대역폭**: 약 20GB

## 💡 비용 절약 팁

### 1. 무료 티어 최대 활용
- Vercel Hobby: 100GB 대역폭 무료
- PlanetScale: 5GB 스토리지 무료
- Cloudflare: CDN 무료

### 2. 데이터 최적화
- 이미지 압축 (WebP 포맷)
- 오래된 데이터 아카이브
- 불필요한 로그 정리

### 3. 캐싱 전략
- Vercel Edge Cache 활용
- 정적 자원 CDN 배포
- API 응답 캐싱

## ⚠️ 확장 시나리오

### 시나리오 1: 사용량 증가 (무료 한도 초과)
```
현재: $0/월
→ Vercel Pro: $20/월
→ PlanetScale Scale: $29/월
총: $49/월 (약 58,000원)
```

### 시나리오 2: 사용자 300명 증가
```
→ Railway Pro: $20/월
또는
→ DigitalOcean: $35/월
```

### 시나리오 3: 기업용 안정성 필요
```
→ AWS/GCP 전환
→ 월 $100-200 예상
```