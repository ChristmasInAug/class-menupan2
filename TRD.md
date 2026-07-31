# TRD — 카페 메뉴판 (Excel 구동)

> Technical Requirements Document. "어떻게" 만든다. 제품 요구사항(무엇을·왜)은 [PRD.md](./PRD.md) 참고.
> 개발 프로세스(TDD)는 [CLAUDE.md](./CLAUDE.md) 참고.

## 1. 아키텍처 개요

```text
점주가 Excel 수정 → 저장
        │
        ▼
data/menu.xlsx ──(chokidar 파일 감시, 300ms 디바운스)──▶ server.mjs
        │                                                    │
        │                                    SSE: event: menu-updated
        ▼                                                    ▼
   재파싱(JSON)  ◀──────── GET /api/menu ────────  브라우저(메뉴판) ── 선택 테마로 재렌더
```

- **server.mjs**: 파일 감시(chokidar) → Excel 파싱(xlsx/SheetJS) → JSON 변환 → SSE 푸시. `_` 접두사가 아닌 시트만 페이지로 변환하고, `_설정` 시트에서 매장명·테마·자동전환초를 읽는다.
- **SSE(Server-Sent Events)**: 메뉴판은 서버→클라이언트 단방향 읽기 전용 표시이므로 WebSocket 대신 SSE로 충분하다. 재연결은 브라우저 EventSource 기본 동작에 위임한다.
- **디바운스 300ms**: Excel 저장 시 OS/애플리케이션이 발생시키는 중복 파일 이벤트(임시 파일 생성/삭제 등)를 한 번의 갱신으로 합친다.

## 2. 폴더 구조

```text
class-menupan2/
├── package.json          # 의존성: express, chokidar, xlsx(SheetJS)
├── server.mjs             # 파일 감시 + Excel 파싱 + SSE 푸시
├── data/
│   └── menu.xlsx          # 실 데이터 (커피/디저트/음료 + _설정)
├── docs/
│   └── menu-project-requirement.md
├── design/                # Claude Design 핸드오프 번들 (UI 프로토타입, 참고용)
│   └── project/메뉴판 템플릿 시스템.dc.html
└── public/
    ├── index.html          # 메뉴판 화면
    ├── client.js           # SSE 수신 + 렌더링
    └── templates/
        ├── board-grid.css   # 공통 레이아웃(테마 변수 기반)
        ├── cafe-dark.css    # 테마 1: 어두운 카페(앰버)
        └── bistro-light.css # 테마 2: 밝은 비스트로(브릭레드)
```

> `server.mjs`, `package.json`, `public/*`는 아직 미구현. 본 문서는 구현 대상 스펙이다.

## 3. 기술 스택

| 영역 | 선택 | 비고 |
|---|---|---|
| 런타임 | Node.js (`.mjs` = ESM) | |
| HTTP 서버 | express | 정적 파일 서빙 + `/api/menu` + SSE 엔드포인트 |
| 파일 감시 | chokidar | `data/menu.xlsx` 감시, 300ms 디바운스 |
| Excel 파싱 | xlsx (SheetJS) | **npm 레지스트리(0.18.5, 구버전) 대신 공식 CDN 사용** |
| 프론트엔드 | Vanilla JS + CSS 변수 | 프레임워크 없이 `client.js` + 테마 CSS |
| 실시간 갱신 | SSE (EventSource) | 단방향 읽기 전용이므로 WebSocket 불필요 |

### 3.1 SheetJS 설치 주의사항

`package.json`은 SheetJS를 공식 CDN에서 받도록 지정해야 한다.

```json
"xlsx": "https://cdn.sheetjs.com/xlsx-0.20.3/xlsx-0.20.3.tgz"
```

`npm install xlsx`(레지스트리 버전)는 사용하지 않는다 — 4년 이상 방치된 0.18.5 구버전이다. SheetJS는 배포를 자체 CDN으로 이전했다. 보안 스캐너(Snyk 등)가 SheetJS에 대해 오탐을 내는 알려진 이슈가 있으나 공식적으로 무시 권장 대상이다.

## 4. 데이터 흐름 · API 설계

| 엔드포인트 | 메서드 | 설명 |
|---|---|---|
| `/` | GET | `public/index.html` 정적 서빙 |
| `/api/menu` | GET | 현재 파싱된 메뉴 JSON 반환 (초기 로드용) |
| `/api/events` (예시) | GET (SSE) | `menu-updated` 이벤트 스트림. Excel 저장 시마다 1회 발행 |

`menu-updated` 이벤트 payload는 `/api/menu`가 반환하는 것과 동일한 구조의 JSON이어야 한다(클라이언트가 별도 재요청 없이 바로 렌더링 가능하도록).

## 5. Excel → JSON 파싱 규칙

1. 워크북의 모든 시트를 순회한다.
2. 시트명이 `_`로 시작하면 → 페이지 목록에서 제외. `_설정` 시트는 별도 파싱해 전역 설정 객체로 만든다.
3. 나머지 시트는 각각 하나의 페이지가 된다. 시트명 = 페이지 제목.
4. 각 시트의 1행을 헤더로 사용, 2행부터 데이터 행으로 파싱한다. 컬럼: `메뉴명, 가격, 설명, 품절, 카테고리`.
5. `가격`은 숫자로 파싱(문자/통화기호 포함 시 파싱 실패 케이스로 처리 — 테스트 대상).
6. `품절`은 값이 정확히 `"Y"`일 때만 true, 그 외(빈칸 포함)는 false.
7. `_설정` 시트는 `항목/값` 2열 표를 key-value 객체로 변환한다 (`매장명`, `테마`, `자동전환초`).

## 6. 파일 감시 · 디바운스

- chokidar가 `data/menu.xlsx`를 감시한다.
- 파일 변경 이벤트 발생 시 300ms 동안 추가 이벤트를 흡수(디바운스)한 뒤 1회만 재파싱 + SSE 푸시한다.
- 파싱 실패(파일 잠금, 손상 등) 시 이전 정상 상태를 유지하고 에러를 로그로 남긴다(화면을 깨뜨리지 않음).

## 7. 프론트엔드 렌더링

- `client.js`가 페이지 로드 시 `/api/menu`로 초기 데이터를 받고, 이후 SSE로 `menu-updated`를 구독한다.
- 테마는 `_설정.테마` 값에 따라 `cafe-dark.css` 또는 `bistro-light.css`를 로드/전환한다. 레이아웃 자체(`board-grid.css`)는 테마와 무관하게 공통.
- `자동전환초` > 0이면 클라이언트에서 `setInterval`로 페이지를 순환한다.

## 8. 비기능 요구사항

- **지연시간**: Excel 저장 → 화면 갱신까지 디바운스 300ms 포함 3초 이내.
- **복원력**: SSE 연결이 끊겨도 브라우저 `EventSource`가 자동 재연결한다. 서버 재시작 시에도 재연결 후 최신 상태를 받아야 한다.
- **로컬 파일 특성 한계**: 로컬 `.xlsx`는 저장(Ctrl+S) 시점에만 디스크에 기록되므로, 저장 전 변경은 감지되지 않는다(PRD 4.3 참고). OneDrive 자동저장 환경은 예외.

## 9. 디자인 레퍼런스

`design/` 디렉터리는 Claude Design에서 내보낸 UI 프로토타입 핸드오프 번들이다(`design/project/메뉴판 템플릿 시스템.dc.html` 등). `public/` 구현 전 반드시 해당 파일을 읽고 시각 스펙(레이아웃·색·타이포)을 파악한다. 프로토타입의 내부 구조를 그대로 복제하는 것이 아니라, 시각적 결과물을 목표 스택(vanilla JS/CSS)으로 재현하는 것이 목표다.

## 10. 테스트 전략 (TDD 대상)

개발 프로세스는 [CLAUDE.md](./CLAUDE.md)의 TDD 사이클을 따른다. 우선순위가 높은 테스트 대상:

1. Excel 파서: 시트 → 페이지 변환, `_` 접두사 제외, 헤더 매핑.
2. `_설정` 파싱: 매장명/테마/자동전환초 key-value 변환, 기본값 처리.
3. 품절(`Y`) 판정 로직 (정확히 `"Y"`만 true).
4. 가격 숫자 파싱(정상/비정상 입력).
5. 디바운스 로직 (연속 이벤트 → 1회 처리).
6. `/api/menu` 응답 스키마.
7. SSE 이벤트 발행(파일 변경 시 정확히 1회).
