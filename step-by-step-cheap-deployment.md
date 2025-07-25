# 150명 사용자용 초저비용 배포 가이드 (월 0-15,000원)

## 🎯 최적 방안: Vercel + PlanetScale
**초기 비용: $0/월, 확장 시: $20/월 (약 24,000원)**

### 📊 150명 사용자 예상 사용량
- **월 점검 기록**: 150명 × 4회 = 600건
- **데이터베이스 크기**: 약 500MB (첫 해)
- **월 트래픽**: 15-20GB
- **동시 접속**: 20-30명

## 🚀 단계별 실행 가이드

### 1단계: GitHub 저장소 생성 및 업로드 (5분)

**1-1. GitHub 저장소 만들기**
```
1. GitHub.com 로그인
2. "New repository" 클릭
3. Repository name: boiler-inspection-150users
4. Private 선택
5. "Create repository" 클릭
```

**1-2. Replit 코드 GitHub에 업로드**
```bash
# Replit Shell에서 차례로 실행
git init
git add .
git commit -m "150명 사용자용 보일러 점검 앱"
git remote add origin https://github.com/[사용자명]/boiler-inspection-150users.git
git push -u origin main
```

### 2단계: PlanetScale 무료 데이터베이스 설정 (10분)

**2-1. PlanetScale 회원가입**
```
1. planetscale.com 접속
2. "Sign up free" 클릭
3. GitHub 계정으로 로그인
4. 무료 플랜 선택 (5GB 포함)
```

**2-2. 데이터베이스 생성**
```
1. "Create database" 클릭
2. Database name: boiler-inspection
3. Region: ap-northeast (서울/도쿄 근처)
4. "Create database" 클릭
```

**2-3. 연결 정보 생성**
```
1. 생성된 DB 클릭 → "Connect" 탭
2. "Create password" 클릭
3. Name: production
4. "Create password" 클릭
5. 연결 문자열 복사 (나중에 사용)
예: mysql://username:password@host/database?ssl={"rejectUnauthorized":true}
```

### 3단계: MySQL 호환 코드 수정 (15분)

PlanetScale은 MySQL이므로 현재 PostgreSQL 코드를 수정해야 합니다.

**3-1. 패키지 변경**
```bash
# Replit Shell에서 실행
npm uninstall @neondatabase/serverless drizzle-orm
npm install mysql2 drizzle-orm@mysql
```

**3-2. 스키마 파일 교체**
MySQL용 스키마 파일을 생성했습니다. (mysql-schema.ts)

**3-3. DB 연결 파일 수정**
server/db.ts 파일을 MySQL용으로 수정해야 합니다.

### 4단계: Vercel 무료 배포 (5분)

**4-1. Vercel 회원가입**
```
1. vercel.com 접속
2. "Sign up" → GitHub 계정 연결
3. 무료 Hobby 플랜 선택
```

**4-2. GitHub 저장소 연결**
```
1. Vercel 대시보드에서 "New Project"
2. GitHub 저장소 검색: boiler-inspection-150users
3. "Import" 클릭
4. Framework: Other (자동 감지됨)
```

**4-3. 환경 변수 설정**
```
DATABASE_URL=mysql://[PlanetScale 연결 문자열]
SESSION_SECRET=super-secret-random-key-12345
REPL_ID=boiler-inspection-app
NODE_ENV=production
```

**4-4. 배포 실행**
```
"Deploy" 클릭 → 3-5분 대기
배포 완료 시 앱 URL 생성됨
```

### 5단계: 데이터베이스 스키마 적용 (3분)

**5-1. Vercel 터미널에서 실행**
```bash
npm run db:push
```

또는 PlanetScale 콘솔에서 직접 SQL 실행 가능

### 6단계: 테스트 및 확인 (5분)

**6-1. 앱 접속 테스트**
- Vercel에서 제공한 URL로 접속
- 로그인 기능 테스트
- 점검 데이터 입력 테스트

**6-2. 데이터베이스 확인**
- PlanetScale 콘솔에서 데이터 확인
- 테이블 생성 여부 확인

## 💰 비용 상세 분석

### 무료 티어 한도 (150명 충분)
```
Vercel Hobby (무료):
- 100GB 대역폭/월
- 100GB-hours 실행 시간
- 무제한 배포

PlanetScale (무료):
- 5GB 스토리지
- 10억 행 읽기/월
- 1천만 행 쓰기/월
```

### 예상 사용량 vs 무료 한도
```
예상 사용량:
- 스토리지: 500MB (첫 해)
- 대역폭: 20GB/월
- DB 읽기: 100만 행/월
- DB 쓰기: 10만 행/월

무료 한도 대비: 20% 사용률
→ 무료로 1-2년 운영 가능
```

### 확장 시나리오별 비용
```
시나리오 1 (300명 사용자):
- Vercel Pro: $20/월
- PlanetScale 무료: $0/월
총: $20/월 (24,000원)

시나리오 2 (500명 사용자):
- Vercel Pro: $20/월
- PlanetScale Scale: $29/월
총: $49/월 (58,000원)
```

## 🔧 비용 절약 추가 팁

### 1. 데이터 최적화
- 오래된 점검 기록 아카이브 (6개월 후)
- 이미지 파일 압축 (WebP 형식)
- 불필요한 로그 제거

### 2. 트래픽 최적화
- Vercel Edge Cache 활용
- 이미지 CDN 최적화
- API 호출 최소화

### 3. 대안 백업 플랜
- 사용량 초과 시 Railway 이전 ($5/월)
- Render + Neon 조합 ($7/월)

## ⚠️ 주의사항

### 무료 티어 제한 모니터링
1. **Vercel 사용량 확인**
   - 대시보드에서 대역폭 사용량 체크
   - 90% 도달 시 Pro 플랜 고려

2. **PlanetScale 사용량 확인**
   - 스토리지 및 쿼리 사용량 모니터링
   - 80% 도달 시 확장 플랜 고려

### 성능 최적화
1. **데이터베이스 쿼리 최적화**
2. **이미지 파일 크기 제한**
3. **불필요한 API 호출 제거**

## 📈 성공 지표
- 150명 사용자가 무료 티어에서 안정적 운영
- 월 20GB 대역폭 내 유지
- 5GB 스토리지 내 유지
- 응답 시간 2초 이내 유지