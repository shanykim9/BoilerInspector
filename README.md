# 보일러 점검 관리 시스템

캐스케이드 시스템 설치 현장의 정기점검을 위한 모바일 웹 앱입니다.

## 주요 기능

- 📋 점검정보 입력 및 관리
- 🏗️ 설치정보 및 기술적 세부사항 관리
- ✅ 23개 항목 체크리스트 (펼침/접힘, 사유 입력)
- 📷 현장사진 업로드
- 📄 고품질 PDF 생성 및 다운로드
- 💾 자동 저장 기능
- 👥 사용자 인증 및 권한 관리

## 기술 스택

### Frontend
- React 18 + TypeScript
- Vite (빌드 도구)
- Tailwind CSS + shadcn/ui
- TanStack Query (상태 관리)
- React Hook Form + Zod (폼 검증)

### Backend
- Node.js + Express
- TypeScript
- PostgreSQL + Drizzle ORM
- Passport.js (인증)
- Multer (파일 업로드)

## GitHub 배포 가이드

### 1. 환경 요구사항
- Node.js 18+
- PostgreSQL 데이터베이스

### 2. 환경 변수 설정
```env
DATABASE_URL=postgresql://username:password@host:port/database
SESSION_SECRET=your-random-secret-key
REPL_ID=your-app-id
ISSUER_URL=https://replit.com/oidc
REPLIT_DOMAINS=your-domain.com
```

### 3. 로컬 개발 설정
```bash
# 의존성 설치
npm install

# 데이터베이스 스키마 적용
npm run db:push

# 개발 서버 실행
npm run dev
```

### 4. 프로덕션 배포

#### Vercel 배포
1. GitHub 저장소를 Vercel에 연결
2. 환경 변수 설정
3. 자동 배포 완료

#### Railway 배포
1. GitHub 저장소를 Railway에 연결
2. PostgreSQL 서비스 추가
3. 환경 변수 설정

### 5. 데이터베이스 마이그레이션
```bash
npm run db:push
```

## 배포 플랫폼별 예상 비용

### Vercel + Neon
- Vercel: 무료 → Pro $20/월
- Neon DB: 무료 (3GB) → Pro $19/월
- **총 비용**: $0-39/월

### Railway
- Railway: $5/월부터 (DB 포함)
- **총 비용**: $5-20/월

### DigitalOcean
- App Platform: $12/월부터
- Managed Database: $15/월부터
- **총 비용**: $27/월부터

## 데이터베이스 구조

- `users`: 사용자 정보
- `inspectors`: 점검자 정보  
- `sites`: 현장/업체 정보
- `inspections`: 점검 기록 (메인 테이블)
- `email_records`: 이메일 발송 기록

## 라이선스

Private Use Only