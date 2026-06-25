# 입찰 공고 분석기 — 개발 노트

## 프로젝트 개요

**목적:** 선엔지니어링 수주전략팀이 나라장터 입찰 공고 PDF를 업로드하면 핵심 정보를 자동 추출·정리해주는 클라이언트 전용 웹 앱

**기술 스택:** Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · pdfjs-dist · docx · lucide-react

**실행:** `npm run dev` → http://localhost:3000

---

## 구현 완료 기능 (M1~M4)

| 마일스톤 | 내용 |
|---------|------|
| M1 | PDF 드래그&드롭 업로드 → 텍스트 추출 → 카드 뷰 (D-Day 배지 포함) |
| M2 | 제출서류 체크리스트 + 진행률 바 + localStorage 자동저장 |
| M3 | 다중 공고 비교 뷰 (다른 항목 노란색 하이라이트) |
| M4 | 유사용역 실적 / 기술자 경력 폼 + .docx 내보내기 |

---

## 파일 구조

```
src/
├── app/
│   ├── layout.tsx                  # lang="ko", StoreProvider, WarningBanner
│   ├── page.tsx                    # 홈: DropZone + NoticeGrid + 비교 버튼
│   ├── notices/[id]/page.tsx       # 상세: 추출 필드 + 탭 (체크리스트/실적/경력)
│   └── compare/page.tsx            # ?ids=a,b,c 쿼리로 비교 테이블
├── types/notice.ts                 # NoticeData, ChecklistItem, ProjectRecord, EngineerCareer
├── lib/
│   ├── pdf-extractor.ts            # pdfjs-dist 래퍼
│   ├── notice-parser.ts            # 정규식 파싱 (나라장터 포맷)
│   ├── docx-exporter.ts            # .docx Blob 생성
│   ├── storage.ts                  # localStorage (5MB 가드, 500ms debounce)
│   └── utils.ts                    # generateId, calcDDay, formatCurrency
├── hooks/
│   ├── useNoticeStore.ts           # 전역 store (Context + useReducer)
│   └── useDebounce.ts
└── components/
    ├── StoreProvider.tsx
    ├── layout/WarningBanner.tsx    # 항상 노출, 숨김 불가
    ├── layout/Header.tsx
    ├── upload/DropZone.tsx
    ├── notices/NoticeCard.tsx
    ├── notices/NoticeGrid.tsx
    ├── notices/DDayBadge.tsx
    ├── detail/ExtractedFields.tsx
    ├── detail/EditableField.tsx    # 연필 아이콘 인라인 편집 (null → amber 경고)
    ├── detail/checklist/
    ├── detail/forms/               # ProjectRecordForm, EngineerCareerForm, ExportButton
    └── compare/CompareTable.tsx
```

---

## 주요 설계 결정

- **완전 클라이언트 전용** — 서버/DB 없음. localStorage에만 저장
- **"원문 확인 필요" 배너** — 항상 노출, 숨길 수 없음 (WarningBanner.tsx)
- **PDF Worker 로컬 배포** — `public/pdf.worker.min.mjs` (CDN 의존 제거)
  - CDN(`cdnjs.cloudflare.com`) 방식은 오프라인/방화벽 환경에서 실패함
- **null 필드 처리** — 추출 실패 시 null 반환 → UI에서 amber "확인 필요" 표시 + 수동 편집 가능

---

## 파서 튜닝 이력 (`src/lib/notice-parser.ts`)

실제 나라장터 공고 PDF(`docs/test.pdf` — 2026년 청주지사 열수송관공사 공공측량 용역)로 검증하며 수정한 내역:

### 1. 추정가격 — `￦` 기호 처리
```
문제: PDF에 "￦ 101,978,182원" 형식으로 기재 → ￦ 기호가 숫자 그룹 앞에 있어 매칭 실패
수정: [￦₩\s]* 를 숫자 캡처 그룹 앞에 추가
```

### 2. 발주기관 — 명시적 라벨 없음
```
문제: PDF에 "발주기관:" 레이블이 없고 문서 끝 서명란에만 기관명 존재
수정: "이상과 같이 공고합니다" 이후 마지막 줄에서 기관명 추출하는 fallback 패턴 추가
```

### 3. 마감일 — 날짜 구분자 2글자
```
문제: "2026. 06. 26.(금) 10:00" 형식에서 ". " (점+공백 = 2글자)를 구분자로 사용
      기존 정규식 [-.\s]는 단일 문자만 처리
수정: [-.\s]+ 로 변경 (1개 이상 허용)
      calcDDay도 동일하게 캡처 그룹 방식으로 수정
```

### 현재 주요 패턴
```typescript
// 공고명
/(?:\d+\s*\.\s*)?공\s*고\s*명\s*[:：]\s*(.+?)(?=\n|$)/m

// 추정가격 (￦ 기호 포함)
/(?:추정가격|예정금액|사업예산)\s*[:：]?\s*[￦₩\s]*([\d,]+\s*원?(?:\s*\(부가세[^)]*\))?)/m

// 마감일 (구분자 1개 이상)
/(?:입찰마감일시?|접수\s*마감일시?|마감일시?|투찰마감)\s*[:：]\s*(\d{4}[-.\s]+\d{1,2}[-.\s]+\d{1,2}(?:[^\n\d][^\n]*)?)/m

// 발주기관 fallback (서명란)
/이상과 같이 공고합니다[\s\S]{0,100}?\n\s*\n?\s*([가-힣A-Za-z\s]+(?:공사|청|원|시|군|구|처|부)\s*[가-힣]*지사?)\s*$/m
```

---

## 테스트 결과 (docs/test.pdf)

| 필드 | 추출 결과 |
|------|---------|
| 공고명 | 2026년 청주지사 열수송관공사 공공측량 용역 |
| 발주기관 | 한국지역난방공사 청주지사 |
| 예정금액 | 101,978,182원 (부가세 별도) |
| 용역기간 | 착수일로부터 24개월 |
| 마감일 | 2026. 06. 26.(금) 10:00 → D-7 (빨간색) |

---

## D-Day 배지 색상 규칙

| 조건 | 색상 |
|------|------|
| D-7 이하 | 빨간색 (red) |
| D-8 ~ D-14 | 주황색 (orange) |
| D-15 이상 | 초록색 (green) |
| 마감 | 회색 (gray) |

---

## 알려진 제약

- **HWP 파일 미지원** — 나라장터 공고 원본이 HWP인 경우 PDF로 변환 후 업로드 필요
- **이미지 PDF 미지원** — 스캔본(이미지) PDF는 텍스트 추출 불가, 필드가 모두 null로 표시됨
- **localStorage 5MB 한도** — 대용량 PDF(rawText 포함)를 많이 저장하면 초과 가능, 경고 표시됨
