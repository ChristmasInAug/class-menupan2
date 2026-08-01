# plan.md — TDD 체크리스트

> [CLAUDE.md](./CLAUDE.md)가 참조하는 작업 목록. 사용자가 **"go"**라고 말하면 아래에서 **가장 위에 있는 미표시(`[ ]`) 항목 하나**를 골라 실패하는 테스트를 작성하고(Red), 그 테스트를 통과시키기에 딱 충분한 만큼만 구현한다(Green). 완료 후 `[x]`로 표시하고, 필요하면 구조적 변경(Tidy First)을 별도 커밋으로 진행한다.
>
> 항목 출처: [TRD.md §10 테스트 전략](./TRD.md#10-테스트-전략-tdd-대상). 순서 = 우선순위.

## 1. Excel 파서 — 시트 → 페이지 변환

- [ ] shouldParseHeaderRowAsColumnNames — 헤더 행을 키로 사용해 데이터 행을 객체로 변환한다
- [ ] shouldConvertNonUnderscoreSheetToPage — `_`로 시작하지 않는 시트를 페이지로 변환한다
- [ ] shouldExcludeUnderscorePrefixedSheetFromPages — `_`로 시작하는 시트는 페이지 목록에서 제외한다
- [ ] shouldMapRowsToMenuItemFields — 행을 메뉴명/가격/설명/품절/카테고리 필드로 매핑한다

## 2. `_설정` 파싱

- [ ] shouldParseSettingsSheetAsKeyValuePairs — `_설정` 시트를 항목/값 key-value 객체로 변환한다
- [ ] shouldDefaultThemeWhenSettingsMissing — 테마 값이 없으면 기본 테마를 사용한다
- [ ] shouldDefaultAutoRotateSecondsToZeroWhenMissing — 자동전환초가 없으면 0(수동)으로 처리한다

## 3. 품절 판정

- [ ] shouldMarkSoldOutOnlyWhenValueIsExactlyY — 품절 값이 정확히 `"Y"`일 때만 true로 판정한다
- [ ] shouldTreatBlankSoldOutAsAvailable — 품절 값이 빈칸이면 판매중으로 처리한다

## 4. 가격 파싱

- [ ] shouldParseNumericPriceAsNumber — 숫자 형태의 가격을 숫자로 파싱한다
- [ ] shouldRejectNonNumericPriceInput — 통화기호/콤마 등 비정상 입력을 에러 또는 명시적 실패로 처리한다

## 5. 디바운스

- [ ] shouldCollapseBurstOfFileEventsIntoSingleReparse — 300ms 내 연속 파일 이벤트를 1회 재파싱으로 합친다

## 6. `/api/menu` 스키마

- [ ] shouldReturnPagesArrayWithStoreNameThemeAutoRotate — 응답이 페이지 배열 + 매장명 + 테마 + 자동전환초를 포함한다

## 7. SSE 발행

- [x] shouldEmitMenuUpdatedEventExactlyOnceAfterDebounce — 디바운스 이후 `menu-updated` 이벤트를 정확히 1회 발행한다

## 8. 페이지 탭 내비게이션 (완료, TDD-IMPLEMENTS.md §8 참고)

## 9. 관리자 설정 화면 (`/admin`)

> 점주가 `_설정` 시트(매장명·테마·디바이스·영문태그·자동전환초)를 Excel을 열지 않고 웹 화면에서 조정한다. 저장 시 `data/menu.xlsx`의 `_설정` 시트에 그대로 반영되고, 기존 SSE 파이프라인을 그대로 타고 프론트(`/`)에 자동 반영된다. 프론트(`/`)는 전체화면 메뉴판만 출력하고 조정 UI는 노출하지 않는다.

- [x] shouldAcceptCorrectAdminCredentials — admin/1234 조합이면 인증 통과
- [x] shouldRejectIncorrectAdminCredentials — 아이디/비번이 틀리면 인증 거부
- [x] shouldSerializeSettingsObjectToSheetRows — 설정 객체 → `_설정` 시트 행 배열 변환(`parseSettingsSheet`의 역변환, 라운드트립 일치)
- [x] shouldRejectUnknownThemeKeyOnSettingsUpdate — 정의되지 않은 테마 키는 저장 거부
- [x] shouldRejectUnknownDeviceKeyOnSettingsUpdate — 정의되지 않은 디바이스 키는 저장 거부
- [x] shouldRequireAuthToAccessAdminApi — 인증 없이 관리자 API 접근 시 401
- [x] shouldPersistSettingsUpdateAndReflectOnNextRead — 설정 저장 후 같은 파일을 다시 읽으면 갱신된 값이 반영됨(임시 xlsx 픽스처로 검증, 실데이터 파일 불변)
