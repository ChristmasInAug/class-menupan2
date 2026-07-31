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
