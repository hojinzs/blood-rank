# 기능 명세: 혈액형 응원/도발 한마디

**버전:** v0.2 (초안)
**작성일:** 2026-03-10
**상태:** 계획 중

---

## 1. 개요

각 혈액형 카드에 익명 한마디를 남길 수 있는 기능. 혈액형 간 티키타카(도발/응원)를 유도하여 재방문과 바이럴을 촉진한다.

### 핵심 가치
- "O형인데 A형 꼴찌 축하해 ㅋㅋ" 같은 크로스 혈액형 댓글로 경쟁심 자극
- 로그인 없이 닉네임 + 혈액형만으로 참여 가능 (Supabase Anonymous Auth)
- 50자 제한으로 가볍고 빠른 참여

---

## 2. 인증: Supabase Anonymous Auth

### 왜 Anonymous Auth인가?
| | 직접 구현 (localStorage UUID) | Supabase Anonymous Auth |
|---|---|---|
| 세션 관리 | 직접 구현 필요 | Supabase가 JWT 관리 |
| RLS 정책 | anon만 가능, 본인 식별 불가 | `auth.uid()`로 본인 댓글 식별 |
| 댓글 삭제 | 서버에서 별도 검증 필요 | RLS로 `auth.uid() = user_id` 체크 |
| 향후 확장 | 마이그레이션 필요 | `linkIdentity()`로 소셜 로그인 연결 |
| 보안 | UUID 탈취 시 사칭 가능 | JWT 기반으로 안전 |

### 등록 플로우
1. 사용자가 댓글 입력 영역 클릭
2. 미등록 상태면 등록 모달 팝업
3. 닉네임 입력 (1-12자) + 혈액형 선택 (A/B/O/AB)
4. 확인 → `supabase.auth.signInAnonymously()` 호출 → `profiles` 테이블에 닉네임/혈액형 저장
5. 이후 재방문 시 Supabase 세션이 자동 유지됨

### 세션 관리
- Supabase JS 클라이언트가 세션 자동 관리 (localStorage에 JWT 저장/갱신)
- `supabase.auth.getSession()`으로 현재 상태 확인
- `supabase.auth.onAuthStateChange()`로 상태 변화 감지
- 브라우저 데이터 삭제 시 세션 소실 → 새로운 익명 유저로 재등록

---

## 3. 데이터 모델

### `profiles` 테이블
`auth.users`의 확장 정보를 저장하는 프로필 테이블.

| 컬럼 | 타입 | 설명 |
|-------|------|------|
| id | uuid (PK, FK → auth.users.id) | Supabase Auth 유저 ID |
| nickname | text (1-12자) | 닉네임 |
| blood_type | text | 사용자 혈액형 (A/B/O/AB) |
| created_at | timestamptz | 가입 시각 |

### `comments` 테이블
| 컬럼 | 타입 | 설명 |
|-------|------|------|
| id | uuid (PK) | |
| user_id | uuid (FK → auth.users.id) | 작성자 |
| target_blood | text | 대상 혈액형 카드 (A/B/O/AB) |
| content | text (1-50자) | 한마디 내용 |
| created_at | timestamptz | 작성 시각 |

### RLS 정책

```sql
-- profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "누구나 프로필 조회" ON profiles FOR SELECT USING (true);
CREATE POLICY "본인 프로필 생성" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "본인 프로필 수정" ON profiles FOR UPDATE USING (auth.uid() = id);

-- comments
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "누구나 댓글 조회" ON comments FOR SELECT USING (true);
CREATE POLICY "인증 유저 댓글 작성" ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "본인 댓글 삭제" ON comments FOR DELETE USING (auth.uid() = user_id);
```

### 핵심 설계: 크로스 댓글
- `target_blood` (어떤 카드에 남겼는지)와 작성자의 `blood_type` (profiles)이 분리됨
- A형 유저가 O형 카드에 도발 가능 → 혈액형 간 티키타카 유도
- 댓글에 작성자 혈액형 뱃지 표시 → "누가 어디에 뭐라 했는지" 한눈에 보임

---

## 4. API / 데이터 접근

### Supabase 클라이언트 직접 호출 (브라우저)
Anonymous Auth를 사용하면 RLS가 유저를 식별하므로, 대부분의 CRUD를 **클라이언트에서 Supabase 직접 호출**로 처리할 수 있다. 별도 API Route가 줄어든다.

| 동작 | 방식 | 비고 |
|------|------|------|
| 익명 로그인 | `supabase.auth.signInAnonymously()` | 클라이언트 |
| 프로필 생성 | `supabase.from('profiles').insert()` | RLS: 본인만 |
| 프로필 조회 | `supabase.from('profiles').select()` | RLS: 누구나 |
| 댓글 조회 | `supabase.from('comments').select('*, profiles(*)')` | JOIN으로 닉네임/혈액형 포함 |
| 댓글 작성 | `supabase.from('comments').insert()` | RLS: 인증 유저만 |
| 댓글 삭제 | `supabase.from('comments').delete()` | RLS: 본인만 |

### API Route (서버)
| 엔드포인트 | 용도 |
|------------|------|
| `POST /api/comments/report` | 신고 접수 (선택적, 추후) |

---

## 5. UI 컴포넌트

### AuthProvider
- Supabase Auth 세션을 React Context로 전역 관리
- `supabase.auth.onAuthStateChange()` 구독
- `{ user, profile, isLoading, signInAnonymously }` 제공
- layout.tsx에서 children 감싸기

### GuestRegistrationModal
- 닉네임 입력 필드 + 혈액형 4개 버튼
- 기존 ShareButton 모달 패턴 참고 (backdrop blur, rounded card)
- 확인 시: `signInAnonymously()` → `profiles` insert → 모달 닫기

### CommentSection
- 각 혈액형 카드 안에 삽입
- 최근 댓글 목록 (1위 카드: 5개, 2-4위 카드: 3개) + "더 보기"
- 하단에 댓글 입력창 (글자수 카운터 포함)
- 본인 댓글에 삭제 버튼 표시

### CommentBubble
- 개별 댓글: `[A] 닉네임: 메시지 내용 · 3분 전`
- 혈액형 뱃지로 작성자 소속 표시
- 본인 댓글이면 삭제 아이콘 표시

---

## 6. 스팸 방지

### 속도 제한
| 레벨 | 제한 | 구현 방식 |
|------|------|-----------|
| 유저당 | 30초 간격, 일 20개 | DB 함수 또는 클라이언트 체크 + DB constraint |
| 게스트 등록 | Supabase Auth 자체 rate limit | Supabase 내장 |

### 콘텐츠 필터링
- URL 포함 차단 (`http://`, `www.`)
- 반복문자 차단 (예: "ㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋ...")
- 기본 욕설 필터 (한국어)
- 공백만 있는 댓글 차단

### DB 레벨
- CHECK 제약조건: content 1-50자, nickname 1-12자
- RLS: `auth.uid()` 기반 정책으로 사칭 불가

---

## 7. Supabase 프로젝트 설정

### 필요한 설정
1. **Anonymous Sign-ins 활성화**: Supabase Dashboard → Authentication → Settings → "Enable anonymous sign-ins" 체크
2. **클라이언트 Supabase 인스턴스**: 기존 `lib/supabase.ts`의 anon key 클라이언트를 브라우저에서 Auth용으로 사용
3. **서버용 클라이언트**: 기존 `supabaseAdmin` (service_role key)은 모더레이션 등 관리용

---

## 8. 파일 구조

```
새로 만들 파일:
├── supabase/migrations/20260311000001_create_comments_tables.sql
├── lib/supabase-browser.ts           → 브라우저용 Supabase 클라이언트 (싱글톤)
├── components/AuthProvider.tsx        → Supabase Auth Context
├── components/GuestRegistrationModal.tsx
├── components/CommentSection.tsx
├── components/CommentBubble.tsx
├── lib/timeago.ts
└── lib/moderation.ts

수정할 파일:
├── app/layout.tsx          → AuthProvider 감싸기
└── app/page.tsx            → 각 카드에 CommentSection 삽입
```

---

## 9. 구현 순서

1. Supabase Dashboard에서 Anonymous Sign-ins 활성화
2. DB migration 작성 및 적용 (profiles + comments + RLS)
3. 브라우저용 Supabase 클라이언트 (`lib/supabase-browser.ts`)
4. AuthProvider 구현
5. UI 컴포넌트 (CommentBubble → GuestRegistrationModal → CommentSection)
6. page.tsx 통합
7. 테스트 및 모바일 반응형 확인

---

## 10. 미결 사항 (TODO)
- [ ] 댓글 신고 기능 필요 여부
- [ ] 댓글 TTL (7일 후 자동 삭제 등)
- [ ] 인기 댓글 정렬 (좋아요 기능)
- [ ] 비속어 필터 수준 결정
- [ ] 모바일에서 댓글 영역 최대 높이 결정
- [ ] 닉네임 변경 기능 필요 여부
- [ ] 향후 소셜 로그인 연동 계획 (linkIdentity)
