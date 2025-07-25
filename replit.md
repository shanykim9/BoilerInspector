# Boiler Inspection Management System

## Overview

This is a full-stack web application for managing boiler inspections, built with modern web technologies. The system provides a mobile-optimized interface for creating, managing, and tracking boiler inspection reports with features like PDF generation, photo uploads, and email notifications.

## System Architecture

### Frontend Architecture
- **Vanilla JavaScript** with modern ES6+ features
- **Tailwind CSS** for utility-first responsive design
- **Font Awesome** icons for consistent UI elements
- Native DOM manipulation and fetch API for data handling
- Mobile-first responsive design optimized for field inspections
- Single-page application with section-based navigation

### Backend Architecture
- **Python Flask** web framework
- **Flask-CORS** for cross-origin resource sharing
- **Flask-SQLAlchemy** for database ORM operations
- RESTful API design with JSON data exchange
- File upload handling with Werkzeug for inspection photos
- PDF generation capability with ReportLab

### Database & ORM
- **PostgreSQL** as the primary database (configurable via DATABASE_URL)
- **SQLAlchemy** ORM for database operations
- Simple schema with Inspector, Site, and Inspection models
- JSON fields for complex data storage (products, checklist, photos)

## Key Components

### Authentication System
- **Replit Authentication** integration with OpenID Connect
- Secure session management with PostgreSQL session store
- User profile synchronization with inspection data
- Protected routes and API endpoints

### Inspection Management
- Multi-step inspection form with progress tracking
- Real-time form validation and data persistence
- Photo upload and attachment system
- PDF report generation with Korean language support
- Email distribution of completed reports

### Data Models
- **Users**: Authentication and profile management
- **Inspectors**: Staff management and assignment
- **Sites**: Location and facility information
- **Inspections**: Core inspection data and workflow
- **Email Records**: Audit trail for report distribution

### File Management
- Local file storage for uploaded inspection photos
- Organized upload directory structure
- File type validation and size limits
- Image optimization for mobile uploads

## Data Flow

1. **User Authentication**: Users authenticate via Replit Auth, creating/updating user records
2. **Inspection Creation**: Users create new inspections by selecting sites and inspectors
3. **Data Collection**: Forms capture inspection details, installation info, and photos
4. **Progress Tracking**: Real-time calculation of completion percentage
5. **Report Generation**: PDF reports generated with inspection data and photos
6. **Email Distribution**: Automated email sending with PDF attachments
7. **History Management**: Complete audit trail of inspections and communications

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL connection and pooling
- **drizzle-orm**: Type-safe database operations
- **express & express-session**: Server framework and session management
- **passport & openid-client**: Authentication middleware
- **multer**: File upload handling
- **nodemailer**: Email functionality
- **jspdf**: PDF generation
- **react-hook-form & zod**: Form validation
- **@tanstack/react-query**: Data fetching and caching

### UI Components
- **@radix-ui/***: Accessible component primitives
- **shadcn/ui**: Pre-built component library
- **tailwindcss**: Utility-first CSS framework
- **lucide-react**: Icon library

## Deployment Strategy

### Replit Configuration
- **Node.js 20** runtime environment
- **PostgreSQL 16** database module
- **Auto-scaling** deployment target for production
- Development and production build processes
- Environment variable management for database and email configuration

### Build Process
- **Development**: `npm run dev` - Vite dev server with hot reloading
- **Production Build**: `npm run build` - Optimized client bundle + server compilation
- **Database Management**: `npm run db:push` - Schema synchronization

### Environment Setup
- Database URL configuration for PostgreSQL connection
- SMTP settings for email functionality
- Session secret for secure authentication
- Replit-specific environment variables for authentication

## Changelog
```
Changelog:
- June 13, 2025. Initial setup
- June 14, 2025. PDF 한글 폰트 문제 해결 - Canvas 기반 텍스트-이미지 변환 시스템 구현
- June 14, 2025. PDF 레이아웃 개선 - 제목 중앙 정렬, 텍스트 크기 최적화
- June 14, 2025. PDF 생성 버튼 기능 완전 구현 - 미리보기와 동일한 기능 제공
- June 15, 2025. 액션 시트 모달 화면 표시 문제 해결 - 중앙 정렬 방식으로 변경하여 모든 환경에서 완전 표시
- June 15, 2025. 워크플로우 개선 - "PDF 생성" → "점검 완료" 라벨 변경, 직관적인 액션 옵션 제공
- June 15, 2025. PDF 생성 시스템 재구축 - AutoTable 제거하고 수동 표 그리기 방식으로 안정화
- June 15, 2025. 고품질 한글 텍스트 렌더링 구현 - 4x 해상도 Canvas 기반으로 선명도 대폭 개선
- June 15, 2025. 날짜 형식 자동 변환 시스템 - 한국식 25-06-14 형식을 데이터베이스 표준 2025-06-14 형식으로 자동 변환
- June 16, 2025. PDF 표 텍스트 크기 최적화 - 한글/영문 텍스트 크기를 표 칸에 맞게 조정 (헤더행 6px, 일반행 5.5px)
- June 16, 2025. PDF 한글 텍스트 균형 조정 - 영문/숫자와 한글 텍스트 크기 시각적 균형 맞춤
- June 16, 2025. PDF 전체 한글 텍스트 통일 - Summary, Site Condition 항목도 표 텍스트와 동일한 5.5px로 조정
- June 16, 2025. 동적 제품 추가 시스템 구현 - 여러 모델 동시 설치 지원, 제품별 설치대수 개별 입력
- June 16, 2025. UI 흐름 개선 - 설치제품 항목을 점검정보 섹션 맨 위로 이동하여 작업 효율성 향상
- June 16, 2025. UI 위치 최적화 - 설치제품 항목을 점검일/점검자 바로 아래, 점검결과 바로 위로 재배치하여 자연스러운 입력 흐름 구현
- June 16, 2025. 진행률 표시기 제거 - 불필요한 진행률 바 삭제로 인터페이스 단순화, 모바일 화면 공간 절약
- June 16, 2025. 설치일/사용년수 항목 재구성 - 점검정보 섹션 내 설치제품 바로 아래 이동, 설치일 입력 시 사용년수 자동 계산 (예: 5년 5개월)
- June 16, 2025. 설치정보 구조 개선 - 설치장소 그룹핑 추가, 기술적 세부사항에서 중복 설치장소 항목 제거하여 정보 구조 체계화
- June 16, 2025. 기술적 세부사항 완전 재구성 - 8개 콤보박스 기반 선택 시스템으로 변경 (사용연료, 연도, 정격전압, 배관, 수질, 제어방식, 설치용도, 남품형태)
- June 18, 2025. 체크리스트 섹션 완전 구현 - 23개 세부 점검항목, 예/아니오 선택, 사유 입력, 펼침/접힘 기능으로 모바일 최적화
- June 18, 2025. 프로덕션 배포 준비 완료 - 모든 핵심 기능 구현 완료, 모바일 테스트 가능
- June 24, 2025. 점검 편집 기능 구현 - 홈화면 최근점검에서 "수정" 버튼으로 기존 점검 수정 가능, 본인 작성 점검만 편집 권한 부여
- June 24, 2025. 제품명 선택 시스템 개선 - 설치제품 섹션을 4가지 고정 제품(NPW, NCN-45HD, NCB790, NFB) 선택 방식으로 변경
- June 24, 2025. 워크플로우 개선 - 페이지 진입 시 임시 ID 자동 생성으로 점검 저장 없이도 즉시 사진 업로드 가능
- June 24, 2025. 사진 업로드 시스템 안정화 - UUID 타입 호환성 문제 해결, 파일 시스템 오류 수정
- June 24, 2025. 체크리스트 개선 - 23개 항목 텍스트 오타 수정, (설치)/(Check) 카테고리 구분 명확화, "전체 Yes" 버튼 추가
- June 24, 2025. 체크리스트 텍스트 재수정 - 7개 항목 추가 오타 수정 (직수환수급기필터, 송풍기, 듀얼벤츄리, 펌프, 믹싱밸브, 삼방밸브)
- June 24, 2025. 알림 시스템 개선 - 편집 모드 알림 완전 제거, 자동저장 알림 완전 제거, 에러 상황에서만 알림 표시 (저장 실패, 네트워크 오류)
- June 25, 2025. 체크리스트 텍스트 입력 오류 수정 - React controlled component 문제 해결, reason 필드 null/undefined 안전 처리
- June 25, 2025. 설치제품 총 대수 텍스트 수정 - "총 X대 설치 예정" → "총 X대 설치"로 간소화
- January 25, 2025. 전체 아키텍처 변경 - React/TypeScript → 바닐라 자바스크립트, Express/Node.js → Python Flask로 완전 재구성
```

## User Preferences

Preferred communication style: Simple, everyday language.