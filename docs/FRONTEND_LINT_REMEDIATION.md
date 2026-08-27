# Frontend lint remediation backlog

## 1. Mục đích

Tài liệu này lưu lại kế hoạch xử lý lint cho Prestige Planner Frontend sau khi Phase 8.5 hoàn tất. Đây là phạm vi cải thiện chất lượng frontend riêng, không thuộc phần chuyển đổi persistence từ JDBC sang JPA ở backend.

Không được làm cho ESLint “pass” bằng cách tắt hàng loạt rule. Mục tiêu là sửa nguyên nhân trong source, giữ nguyên UI, API contract, gateway boundary và hành vi nghiệp vụ hiện tại.

## 2. Baseline ngày 2026-08-26

Các lệnh đã chạy:

```powershell
cd D:\prestige-planner\prestige-planner-frontend
npm run build
npm run lint
```

Kết quả:

- `npm run build`: **PASS**, 2.946 module được transform.
- `npm run lint`: **FAIL**, tổng cộng 90 findings trên 44 file.
- Errors: 79.
- Warnings: 11.
- Working tree frontend sạch tại thời điểm kiểm tra.
- ESLint config đã tồn tại từ commit đầu tiên; lỗi lint không phát sinh từ Phase 8.5 JPA backend.

Phân nhóm theo rule:

| Rule | Số lượng | Mức ưu tiên |
|---|---:|---|
| `no-unused-vars` | 68 | Thấp, dọn code có kiểm soát |
| `react-hooks/exhaustive-deps` | 11 | Trung bình, cần kiểm tra vòng đời request/effect |
| `react-hooks/set-state-in-effect` | 5 | Trung bình đến cao |
| `react-refresh/only-export-components` | 2 | Thấp, ảnh hưởng Fast Refresh khi phát triển |
| `react-hooks/rules-of-hooks` | 1 | Rất cao |
| `react-hooks/purity` | 1 | Cao |
| `react-hooks/preserve-manual-memoization` | 1 | Cao |
| `no-useless-escape` | 1 | Thấp |

File có nhiều findings nhất:

- `src/pages/OrganizerReportAnalyticsPage.jsx`: 12.
- `src/pages/OrganizerEventsPage.jsx`: 6.
- `src/pages/OrganizerFinancePage.jsx`: 4.
- `src/pages/SettingsPage.jsx`: 4.
- `src/pages/DashboardPage.jsx`: 4.

## 3. Trình tự xử lý

### Bước 1 — Sửa lỗi Hooks có nguy cơ ảnh hưởng runtime

Ưu tiên sửa trước các rule sau:

1. `react-hooks/rules-of-hooks` tại `OrganizerReportAnalyticsPage.jsx`.
   - Không gọi `React.useState` bên trong IIFE/callback JSX.
   - Chuyển `hoveredSeg` và `setHoveredSeg` lên top-level của component hoặc tách phần donut/legend thành component riêng.
   - Giữ thứ tự Hooks ổn định giữa mọi render.

2. `react-hooks/purity` tại `SupportPage.jsx`.
   - Không gọi `Math.random()` trực tiếp trong JSX render.
   - Sinh ticket code một lần trong submit handler hoặc state khi request thành công.
   - Không thay ticket code khi component re-render.

3. `react-hooks/preserve-manual-memoization` tại `ThemeContext.jsx`.
   - Dùng functional state update cho `toggleTheme`.
   - Ổn định callback bằng `useCallback`, sau đó đưa callback vào dependency của `useMemo`; hoặc bỏ memoization nếu không tạo giá trị thực tế.
   - Xác nhận theme vẫn toggle đúng sau nhiều lần bấm.

4. Năm lỗi `react-hooks/set-state-in-effect` trong `OrganizerReportAnalyticsPage.jsx`.
   - Gom logic tải dữ liệu thành các hàm async rõ ràng hoặc dùng reducer/query abstraction.
   - Tránh tạo chuỗi render không cần thiết.
   - Thêm cleanup/ignore flag hoặc `AbortController` để response cũ không ghi đè filter mới.
   - Giữ nguyên loading, success và error behavior hiện tại.

### Bước 2 — Xử lý dependency của Hooks

Xử lý 11 cảnh báo `react-hooks/exhaustive-deps` theo từng effect/memo:

- Không thêm dependency một cách máy móc nếu dependency thay đổi mỗi render.
- Dùng `useCallback` cho hàm fetch được effect gọi lại.
- Dùng `useMemo` cho array/object được dùng làm dependency khi thật sự cần ổn định tham chiếu.
- Nếu effect chỉ cần chạy lúc mount, tách dữ liệu đầu vào bất biến hoặc giải thích bằng comment cụ thể; không tắt rule toàn cục.
- Kiểm tra không phát sinh request loop, double fetch ngoài hành vi React Strict Mode hoặc stale closure.

Các file cần chú ý gồm:

- `StatisticsSection.jsx`.
- `AttendeeExplorePage.jsx`.
- `AttendeeReviewPage.jsx`.
- `BroadcastPage.jsx`.
- `DashboardPage.jsx`.
- `EventsPage.jsx`.
- `GlobalEventsPage.jsx`.
- `SettingsPage.jsx`.
- `ThemeContext.jsx`.

### Bước 3 — Dọn unused imports và variables

Xử lý 68 lỗi `no-unused-vars`:

- Xóa import `motion` nếu file không dùng animation component.
- Xóa state, setter, helper, mock data, callback parameter và destructured field không dùng.
- Với `catch`, bỏ biến lỗi nếu không log/hiển thị; không giữ `error`/`err` chỉ để trống.
- Không đổi tên thành `_...` chỉ để né rule trừ khi tham số bắt buộc bởi API/interface và có giải thích hợp lý.
- Không xóa code có chủ đích cho tính năng chưa bật nếu việc xóa làm mất hành vi; di chuyển feature chưa dùng sang backlog hoặc module riêng.

Sau mỗi nhóm file, chạy lại lint để tránh một diff quá lớn khó review.

### Bước 4 — Sửa Fast Refresh và lỗi nhỏ

- Tách `useAuth` khỏi module chỉ export component trong `AuthContext.jsx`, hoặc tổ chức module theo convention tương thích Fast Refresh.
- Làm tương tự cho `ThemeContext.jsx`.
- Xóa escape không cần thiết trong `OrganizerReportTemplatesPage.jsx`.
- Không tắt `react-refresh/only-export-components` trên toàn dự án.

### Bước 5 — Tối ưu bundle sau lint

Build hiện PASS nhưng Vite cảnh báo JavaScript chunk khoảng 1,8 MB trước gzip. Đây không phải blocker lint nhưng nên xử lý sau:

- Lazy-load các page theo route bằng dynamic import.
- Tách chart/report/admin modules thành chunk riêng.
- Chỉ cấu hình `manualChunks` khi đã đo bundle và xác định dependency lớn.
- Không chỉ tăng `build.chunkSizeWarningLimit` để che cảnh báo.

## 4. Kiểm thử bắt buộc

Sau mỗi bước:

```powershell
npm run lint
npm run test:phase8
npm run check:api-boundary
npm run build
```

Sau khi sửa toàn bộ, kiểm tra thủ công tối thiểu:

- Đăng nhập, đăng xuất và khôi phục session.
- Đổi light/dark theme nhiều lần.
- Organizer analytics đổi period/custom date liên tục, không request loop và không hiển thị dữ liệu cũ.
- Audience segment hover hoạt động.
- Support ticket code không đổi khi component re-render.
- Broadcast, Events, Dashboard và Settings vẫn tải dữ liệu đúng.
- Không có direct service URL; mọi request tiếp tục đi qua gateway Axios instance.

## 5. Tiêu chí hoàn thành

Chỉ coi frontend lint remediation hoàn thành khi:

- `npm run lint` trả về exit code 0, không còn error.
- Không tắt global rule để đạt kết quả giả.
- `npm run build` PASS.
- `npm run test:phase8` PASS.
- `npm run check:api-boundary` PASS.
- Các luồng smoke thủ công ở trên PASS.
- Không thay đổi API contract hoặc gateway routing ngoài phạm vi được phê duyệt.
- Diff được review, không chứa refactor UI/nghiệp vụ không liên quan.

## 6. Chiến lược commit đề xuất

Không nên trộn việc dọn lint vào commit Phase 8.5 persistence. Có thể chia thành:

```text
fix(frontend): correct hooks lifecycle and render purity
refactor(frontend): remove unused imports and dead variables
refactor(frontend): separate context hooks for fast refresh
perf(frontend): split oversized production bundles
```

Nếu muốn một commit duy nhất sau khi toàn bộ kiểm thử PASS:

```text
fix(frontend): resolve lint violations and stabilize hooks
```
