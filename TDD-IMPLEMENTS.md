# TDD-IMPLEMENTS.md

`/tdd-red`, `/tdd-green`, `/tdd-refactor`가 읽고 쓰는 작업 목록. [plan.md](./plan.md)의 항목을 그대로 가져와 항목별로 **Red → Green → Refactor** 3단계 체크박스로 쪼갠 것이다. 원칙 출처는 [CLAUDE.md](./CLAUDE.md)(켄트 벡 TDD / Tidy First).

## 진행 규칙

- **한 번에 항목 하나만** 진행한다. 위에서부터 순서대로.
- 항목의 세 체크박스는 반드시 `Red → Green → Refactor` 순서로 채워진다. 순서를 건너뛰지 않는다.
- `Refactor`는 "정리할 게 없으면" 빈 diff로 완료 처리해도 되지만, 반드시 코드 품질 기준을 실제로 점검한 뒤에만 체크한다.
- 각 단계는 [CLAUDE.md 커밋 규율](./CLAUDE.md)에 따라 구조적/행위적 변경을 분리해 커밋한다(사용자 확인 후).

---

## 1. Excel 파서 — 시트 → 페이지 변환

### 1.1 shouldParseHeaderRowAsColumnNames
헤더 행을 키로 사용해 데이터 행을 객체로 변환한다.
- [x] Red — `test/excelParser.test.mjs` 작성, `lib/excelParser.mjs` 부재로 `ERR_MODULE_NOT_FOUND` 확인됨
- [x] Green — `lib/excelParser.mjs`에 `parseSheetRows` 구현, `npm test` 1 pass 확인됨
- [x] Refactor — 코드 품질 기준 점검, 정리할 것 없음 (변경 없음)

### 1.2 shouldConvertNonUnderscoreSheetToPage
`_`로 시작하지 않는 시트를 페이지로 변환한다.
- [x] Red — `test/excelParser.test.mjs`에 테스트 추가, `parseWorkbookToPages` 미구현으로 `SyntaxError: does not provide an export named 'parseWorkbookToPages'` 확인됨
- [x] Green — `lib/excelParser.mjs`에 `parseWorkbookToPages` 구현(내부에서 `parseSheetRows` 재사용), `npm test` 2 pass 확인됨
- [x] Refactor — 코드 품질 기준 점검, 정리할 것 없음 (변경 없음)

### 1.3 shouldExcludeUnderscorePrefixedSheetFromPages
`_`로 시작하는 시트는 페이지 목록에서 제외한다.
- [x] Red — `test/excelParser.test.mjs`에 테스트 추가, `_설정` 시트가 페이지에 포함되어 `AssertionError`(1개 기대, 2개 실제) 확인됨
- [x] Green — `parseWorkbookToPages`에 `title.startsWith('_')` 필터 추가, `npm test` 3 pass 확인됨
- [x] Refactor — Extract Function으로 `isPageSheet(title)` 분리(의도 명확화), `npm test` 3 pass 유지 확인됨

### 1.4 shouldMapRowsToMenuItemFields
행을 메뉴명/가격/설명/품절/카테고리 필드로 매핑한다(정의된 5개 필드만, 예상 밖 컬럼은 무시).
- [x] Red — `test/excelParser.test.mjs`에 예상 밖 컬럼(`메모`) 포함 시트 테스트 추가, 결과에 `메모` 키가 남아 `AssertionError`(5개 기대, 6개 실제) 확인됨
- [x] Green — `MENU_ITEM_FIELDS` allowlist로 `parseSheetRows` 필터링, `npm test` 4 pass 확인됨
- [x] Refactor — 코드 품질 기준 점검, 정리할 것 없음 (변경 없음)

## 2. `_설정` 파싱

### 2.1 shouldParseSettingsSheetAsKeyValuePairs
`_설정` 시트를 항목/값 key-value 객체로 변환한다.
- [x] Red — `test/excelParser.test.mjs`에 테스트 추가, `parseSettingsSheet` 미구현으로 `SyntaxError: does not provide an export named 'parseSettingsSheet'` 확인됨
- [x] Green — `parseSettingsSheet` 구현(항목/값 행을 key-value 객체로 변환), `npm test` 5 pass 확인됨
- [x] Refactor — Inline: 항등 `.map()` 제거하고 `Object.fromEntries(body)` 직접 사용, `npm test` 5 pass 유지 확인됨

### 2.2 shouldDefaultThemeWhenSettingsMissing
테마 값이 없으면 기본 테마(`cafe-dark`)를 사용한다.
- [x] Red — `test/excelParser.test.mjs`에 테마 행 없는 케이스 추가, `settings.테마`가 `undefined`로 나와 `AssertionError`(`'cafe-dark'` 기대) 확인됨
- [x] Green — `DEFAULT_SETTINGS` 스프레드로 `테마` 기본값 적용, `npm test` 6 pass 확인됨
- [x] Refactor — 코드 품질 기준 점검, 정리할 것 없음 (변경 없음)

### 2.3 shouldDefaultAutoRotateSecondsToZeroWhenMissing
자동전환초가 없으면 0(수동)으로 처리한다.
- [x] Red — `test/excelParser.test.mjs`에 자동전환초 행 없는 케이스 추가, `settings.자동전환초`가 `undefined`로 나와 `AssertionError`(`0` 기대) 확인됨
- [x] Green — `DEFAULT_SETTINGS`에 `자동전환초: 0` 추가, `npm test` 7 pass 확인됨
- [x] Refactor — 코드 품질 기준 점검, 정리할 것 없음 (변경 없음)

## 3. 품절 판정

### 3.1 shouldMarkSoldOutOnlyWhenValueIsExactlyY
품절 값이 정확히 `"Y"`일 때만 true로 판정한다.
- [x] Red — `test/excelParser.test.mjs`에 테스트 추가, `isSoldOut` 미구현으로 `SyntaxError: does not provide an export named 'isSoldOut'` 확인됨
- [x] Green — `isSoldOut(value)` 구현(`value === 'Y'`), `npm test` 8 pass 확인됨
- [x] Refactor — 코드 품질 기준 점검, 정리할 것 없음 (변경 없음)

### 3.2 shouldTreatBlankSoldOutAsAvailable
품절 값이 빈칸이면 판매중으로 처리한다.
- [x] Red — `test/excelParser.test.mjs`에 테스트 추가, 실행 결과 **Red 없이 즉시 통과**(9 pass, 0 fail). `isSoldOut`이 이미 `value === 'Y'` 동등비교라 3.1 구현이 이 요구사항까지 커버함. 코드 변경 없이 회귀 테스트로 채택
- [x] Green — 별도 구현 불필요(3.1에서 이미 충족), `npm test` 9 pass 확인됨
- [x] Refactor — 코드 변경 자체가 없어 점검 대상 없음

## 4. 가격 파싱

### 4.1 shouldParseNumericPriceAsNumber
숫자 형태의 가격을 숫자로 파싱한다.
- [x] Red — `test/excelParser.test.mjs`에 테스트 추가, `parsePrice` 미구현으로 `SyntaxError: does not provide an export named 'parsePrice'` 확인됨
- [x] Green — `parsePrice(value)` 구현(`Number(value)`), `npm test` 10 pass 확인됨
- [x] Refactor — 코드 품질 기준 점검, 정리할 것 없음 (변경 없음)

### 4.2 shouldRejectNonNumericPriceInput
통화기호/콤마 등 비정상 입력을 에러 또는 명시적 실패로 처리한다.
- [x] Red — `test/excelParser.test.mjs`에 `'₩4,500'` 입력 테스트 추가, throw 안 하고 `NaN` 반환해 `AssertionError: Missing expected exception` 확인됨
- [x] Green — `parsePrice`에 `Number.isNaN` 검사 후 `throw new Error(...)` 추가, `npm test` 11 pass 확인됨
- [x] Refactor — 코드 품질 기준 점검, 정리할 것 없음 (변경 없음)

## 5. 디바운스

### 5.1 shouldCollapseBurstOfFileEventsIntoSingleReparse
300ms 내 연속 파일 이벤트를 1회 재파싱으로 합친다.
- [x] Red — `test/debounce.test.mjs` 작성(`node:test` mock timers 사용), `lib/debounce.mjs` 부재로 `ERR_MODULE_NOT_FOUND` 확인됨
- [x] Green — `lib/debounce.mjs`에 `debounce(fn, delayMs)` 구현(clearTimeout+setTimeout), `npm test` 12 pass 확인됨
- [x] Refactor — 코드 품질 기준 점검, 정리할 것 없음 (변경 없음)

## 6. `/api/menu` 스키마

### 6.1 shouldReturnPagesArrayWithStoreNameThemeAutoRotate
응답이 페이지 배열 + 매장명 + 테마 + 자동전환초를 포함한다(HTTP 라우트 없이 순수 함수 `buildMenuResponse`로 먼저 구현, express 배선은 별도 단계).
- [x] Red — `test/excelParser.test.mjs`에 테스트 추가, `buildMenuResponse` 미구현으로 `SyntaxError: does not provide an export named 'buildMenuResponse'` 확인됨
- [x] Green — `buildMenuResponse(sheets)` 구현(`parseSettingsSheet` + `parseWorkbookToPages` 조합), `npm test` 13 pass 확인됨
- [x] Refactor — Extract Constant: `'_설정'` 매직 스트링을 `SETTINGS_SHEET_NAME`으로 명명, `npm test` 13 pass 유지 확인됨

## 7. SSE 발행

### 7.1 shouldEmitMenuUpdatedEventExactlyOnceAfterDebounce
디바운스 이후 `menu-updated` 이벤트를 정확히 1회 발행한다.
- [x] Red — `test/menuUpdateEmitter.test.mjs` 작성, `lib/menuUpdateEmitter.mjs` 부재로 `ERR_MODULE_NOT_FOUND` 확인됨
- [x] Green — `createMenuUpdateEmitter(delayMs)` 구현(`debounce` 재사용 + `EventEmitter`), `npm test` 14 pass 확인됨
- [x] Refactor — Extract Constant: `'menu-updated'` 매직 스트링을 `MENU_UPDATED_EVENT`로 추출해 lib/test 양쪽에서 공유, `npm test` 14 pass 유지 확인됨

## 8. 페이지 탭 내비게이션 (클릭 전환)

> 발견 경위: 프론트가 여러 시트(커피/디저트/음료) 중 첫 페이지에 고정되는 버그 리포트. 원인은 `client.js`에 페이지 전환 UI 자체가 없었고, `자동전환초=0`이라 자동전환도 안 됨. 페이지 선택 로직을 DOM과 분리된 순수 함수로 뽑아 TDD 대상으로 삼는다.

### 8.1 shouldListAllPageTitlesForTabs
`pages` 배열에서 탭에 표시할 시트명 목록을 순서대로 뽑는다.
- [x] Red — `test/pageNav.test.mjs` 작성, `lib/pageNav.mjs` 부재로 `ERR_MODULE_NOT_FOUND` 확인됨
- [x] Green — `listPageTitles(pages)` 구현, `npm test` 15 pass 확인됨
- [x] Refactor — 코드 품질 기준 점검, 정리할 것 없음 (변경 없음)

### 8.2 shouldFindPageIndexByTitle
클릭한 탭의 시트명으로 해당 페이지 인덱스를 찾는다.
- [x] Red — `test/pageNav.test.mjs`에 테스트 추가, `findPageIndexByTitle` 미구현으로 `SyntaxError: does not provide an export named 'findPageIndexByTitle'` 확인됨
- [x] Green — `findPageIndexByTitle(pages, title)` 구현(`Array.findIndex`), `npm test` 16 pass 확인됨
- [x] Refactor — 코드 품질 기준 점검, 정리할 것 없음 (변경 없음)

### 8.3 shouldFallBackToFirstPageIndexWhenTitleNotFound
존재하지 않는 시트명이 주어지면 첫 페이지(인덱스 0)로 폴백한다(방어적 동작).
- [x] Red — `test/pageNav.test.mjs`에 없는 시트명 케이스 추가, `findIndex`가 `-1` 반환해 `AssertionError`(`0` 기대) 확인됨
- [x] Green — `index === -1 ? 0 : index` 폴백 추가, `npm test` 17 pass 확인됨
- [x] Refactor — 코드 품질 기준 점검, 정리할 것 없음 (변경 없음)

## 9. 관리자 설정 화면 (`/admin`)

> 계기: 점주가 Excel을 열지 않고도 테마·디바이스·매장명 등을 웹에서 바꾸고 싶다는 요구. `design/project/메뉴판 템플릿 시스템.dc.html`과 같은 버튼 방식(테마 8종 × 디바이스 4종)으로 조작하고, 저장 시 `_설정` 시트에 반영 → 기존 chokidar/SSE 파이프라인을 그대로 태워 프론트(`/`)에 자동 반영. PRD 5절의 "사용자 인증/권한 관리 비범위"는 이 기능으로 범위 확장됨(PRD.md 갱신).

### 9.1 shouldAcceptCorrectAdminCredentials / shouldRejectIncorrectAdminCredentials
admin/1234 조합만 인증 통과, 그 외는 거부한다.
- [x] Red — `test/auth.test.mjs` 작성, `lib/auth.mjs` 부재로 `ERR_MODULE_NOT_FOUND` 확인됨
- [x] Green — `lib/auth.mjs`에 `verifyCredentials(username, password)` 구현(상수 비교), `npm test` 19 pass 확인됨
- [x] Refactor — 코드 품질 기준 점검, 정리할 것 없음 (변경 없음)

### 9.2 shouldSerializeSettingsObjectToSheetRows
설정 객체를 `_설정` 시트 행 배열로 직렬화한다. `parseSettingsSheet`와의 라운드트립으로 검증.
- [x] Red — `test/excelParser.test.mjs`에 라운드트립 테스트 추가, `buildSettingsSheetRows` 미구현으로 `SyntaxError` 확인됨
- [x] Green — `lib/excelParser.mjs`에 `buildSettingsSheetRows(settings)` 구현(`[['항목','값'], ...Object.entries(settings)]`), `npm test` 20 pass 확인됨
- [x] Refactor — `SETTINGS_SHEET_NAME` 상수를 export로 전환해 `settingsWriter.mjs`에서 재사용 가능하게 함, `npm test` 20 pass 유지 확인됨

### 9.3 shouldRejectUnknownThemeKeyOnSettingsUpdate / shouldRejectUnknownDeviceKeyOnSettingsUpdate
정의되지 않은 테마/디바이스 키는 저장을 거부한다.
- [x] Red — `test/settingsValidation.test.mjs` 작성, `lib/settingsValidation.mjs` 부재로 `ERR_MODULE_NOT_FOUND` 확인됨
- [x] Green — `lib/catalog.mjs`(테마 8종 · 디바이스 4종 단일 출처, `/lib`로 정적 서빙되어 관리자 프론트에서도 동일 목록 재사용)와 `lib/settingsValidation.mjs`의 `validateSettingsUpdate(settings)` 구현, `npm test` 22 pass 확인됨
- [x] Refactor — 코드 품질 기준 점검, 정리할 것 없음 (변경 없음)

### 9.4 shouldPersistSettingsUpdateAndReflectOnNextRead
설정 저장 후 같은 파일을 다시 읽으면 갱신된 값이 반영되고, 다른 시트는 그대로 남는다(임시 xlsx 픽스처로 검증).
- [x] Red — `test/settingsWriter.test.mjs` 작성, `lib/settingsWriter.mjs` 부재로 `ERR_MODULE_NOT_FOUND` 확인됨
- [x] Green — `lib/settingsWriter.mjs`에 `writeSettingsToFile(filePath, settings)` 구현(검증 → `_설정` 시트 교체 → `XLSX.writeFile`), `npm test` 23 pass 확인됨
- [x] Refactor — 픽스처 워크북 생성 코드를 `testHelpers/xlsxFixture.mjs`로 추출해 `settingsWriter.test.mjs`/`createApp.test.mjs`가 공유하도록 정리. **주의**: 최초 `test/helpers/`에 두었더니 Node 테스트 러너가 `test/` 하위 모든 `.mjs`를 테스트 파일로 오인식해 유령 테스트가 잡힘 — `test/` 밖(`testHelpers/`)으로 이동해 해결. `npm test` 23 pass 유지 확인됨

### 9.5 shouldRequireAuthToAccessAdminApi
인증 없이 관리자 API 접근 시 401, 로그인 후 세션 쿠키로 접근 시 200.
- [x] Red — `test/createApp.test.mjs` 작성. 이 항목은 `server.mjs`에서 `express` 앱 생성 로직을 `lib/createApp.mjs`로 뽑아내는 구조적 변경(Tidy First)이 선행되어야 실제 앱 인스턴스를 임시 포트 + 임시 xlsx 픽스처로 테스트할 수 있었음(기존 `server.mjs`는 실행 시 즉시 `app.listen`이라 격리 테스트 불가) — 추출 직후 `npm test`로 기존 23개 회귀 없음 확인 후 이 테스트 작성
- [x] Green — `lib/createApp.mjs`에 `createApp(menuFilePath)` 구현: `lib/session.mjs`(메모리 토큰 세션) + 쿠키 기반 `requireAdminAuth` 미들웨어 + `/admin/api/login`·`/admin/api/logout`·`/admin/api/settings`(GET/POST) 라우트. `server.mjs`는 `createApp` 호출 + `chokidar.watch` 배선만 남는 얇은 부트스트랩으로 축소. `npm test` 24 pass 확인됨
- [x] Refactor — 코드 품질 기준 점검, 정리할 것 없음 (변경 없음)

### 9.6 관리자 프론트엔드 (자동화 테스트 대상 아님 — 헤드리스 브라우저로 수동 검증)
`public/admin/`에 로그인 폼 + 설정 패널(테마/디바이스 버튼, 매장명/영문태그/자동전환초 입력) 구현. 테마·디바이스 버튼 목록은 `/lib/catalog.mjs`를 그대로 import해 서버·프론트가 단일 출처를 공유한다(다른 pure 함수처럼 단위 테스트 가능한 로직은 이미 `lib/`에서 검증됨; DOM 배선 자체는 `public/client.js`와 동일하게 얇게 유지).
- Chrome DevTools Protocol로 실제 로그인 → 설정 패널 렌더 → 버튼 클릭 → 저장까지 구동해 확인: 401 → 로그인 폼, 로그인 후 현재 `_설정` 값이 정확히 버튼 활성 상태/입력값에 반영됨, 저장 시 200 + 실데이터 파일에 정상 반영(회귀 없음, 기존 값과 동일한 값으로 저장해 실데이터 안전하게 검증).
