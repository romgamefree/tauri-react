# DrivePro CRUD template

Mẫu giao diện quản lý đào tạo lái xe bằng Tauri, React, shadcn/ui, Tailwind CSS và TanStack Table.

## Cấu trúc dự án

```text
src/
  app/                   # Điểm ghép các trang và trạng thái điều hướng
  components/            # Sidebar và thành phần shadcn/ui dùng chung
  layouts/               # Khung ứng dụng
  pages/                 # Trang tổng quan, học viên, giáo viên, xe, khóa học
  features/catalog/      # Bảng, form và hook giao diện dùng chung
  features/students/     # Cấu hình và dữ liệu mẫu học viên
  features/teachers/     # Cấu hình và dữ liệu mẫu giáo viên
  features/vehicles/     # Cấu hình và dữ liệu mẫu xe
  features/courses/      # Cấu hình và dữ liệu mẫu khóa học
  hooks/                 # React hooks dùng chung
  services/              # Service riêng cho từng danh mục và lệnh seed SQLite
  stores/                # Trạng thái giao diện có lưu cục bộ
  types/                 # Kiểu dữ liệu dùng chung
  lib/                   # Hàm tiện ích dùng chung
src-tauri/src/
  commands/              # Lệnh Tauri nhận dữ liệu từ frontend
  models/                # Kiểu dữ liệu backend
  services/              # Kiểm tra và xử lý nghiệp vụ CRUD
  repositories/          # Truy vấn SQLite
  database/              # Kết nối và chạy migration
  lib.rs                 # Khởi tạo ứng dụng và đăng ký lệnh
src-tauri/migrations/   # Lịch sử thay đổi schema SQLite
```

Mỗi danh mục có kiểu dữ liệu trong `src/types/`, cấu hình và dữ liệu mẫu trong thư mục riêng của `src/features/`, service React trong `src/services/`, cùng model, repository, service và command riêng trong backend. Đăng ký command mới tại `src-tauri/src/lib.rs`. Các thành phần trong `src/components/ui/` là mã shadcn/ui dùng chung, tách khỏi nghiệp vụ.

## Danh mục có sẵn

- Học viên
- Giáo viên
- Xe đào tạo
- Khóa học

Mỗi danh mục hỗ trợ thêm, sửa, xóa từng dòng hoặc nhiều dòng, kiểm tra mã trùng, tìm kiếm, lọc trạng thái, sắp xếp, ẩn cột, chọn dòng và phân trang. Ứng dụng hiển thị thông báo sau khi thêm, sửa, sao chép ID, xóa và báo lỗi khi thao tác thất bại. Ứng dụng Tauri lưu dữ liệu trong SQLite tại thư mục dữ liệu ứng dụng (`drivepro.sqlite3`), trong bốn bảng riêng `students`, `teachers`, `vehicles` và `courses`. Cơ sở dữ liệu mới tạo thẳng bốn bảng này. Cơ sở dữ liệu cũ được chuyển một lần và giữ payload gốc trong `legacy_records_backup`. Các trang luôn đọc dữ liệu từ SQLite và không tự thêm dữ liệu mẫu. Nút **Seed dữ liệu** trên trang tổng quan chỉ thêm bản mẫu còn thiếu, giữ nguyên các dòng đã có. Bản xem trước trong trình duyệt không có backend Tauri nên không truy cập được dữ liệu.

Học viên, giáo viên, xe đào tạo và khóa học có file trang riêng trong `src/pages/`. Mỗi trang tự chọn các chỉ số cần hiển thị; phần bảng, form và hộp xác nhận dùng chung nằm trong `src/features/catalog/`.

Các chức năng phân công, lịch sử thay đổi, cảnh báo hết hạn, báo cáo và in ấn trong [requirement.md](./requirement.md) chưa có xử lý nghiệp vụ. SQLite hiện lưu các bản ghi CRUD của bốn danh mục; chưa có quan hệ nghiệp vụ giữa các danh mục.

## Thư viện backend

Backend dùng `tauri`, `serde`, `serde_json`, `rusqlite`, `thiserror`, `tracing` và `tracing-subscriber`. `rusqlite` giữ SQL trong backend và phù hợp với một cơ sở dữ liệu SQLite cục bộ. `thiserror` phân loại lỗi đầu vào, trùng mã và lỗi SQLite. `tracing` ghi kết quả lệnh CRUD mà không ghi nội dung hồ sơ; đặt `RUST_LOG=react=debug` khi chạy ứng dụng để xem log chi tiết trong terminal. Log hiện chưa được lưu thành file.

Chưa cần `tokio`, `sqlx`, `anyhow`, `uuid`, `chrono`, `validator` hoặc `argon2`: các lệnh hiện xử lý dữ liệu cục bộ, ID được tạo ở frontend, ngày cập nhật lấy từ SQLite, kiểm tra trường bắt buộc nằm ở service và chưa có mật khẩu. Các plugin SQL, filesystem, dialog, store, updater, notification, clipboard, autostart, window state và stronghold sẽ được thêm khi có chức năng tương ứng. Dữ liệu CRUD hiện đi qua lệnh Tauri nên không cần mở quyền thực thi SQL trực tiếp từ frontend.

## Chạy dự án

```bash
npm install
npm run dev
```

Để chạy ứng dụng desktop:

```bash
npm run tauri dev
```

Tên ứng dụng và thông tin license trong sidebar được đọc từ `.env` qua `APP_NAME` và `APP_LICENSE`. Hai giá trị này được đóng gói vào frontend, nên không dùng `APP_LICENSE` làm bí mật xác thực.

## Build trên GitHub Actions

Mỗi lần đẩy code lên nhánh `main`, workflow [build-desktop.yml](./.github/workflows/build-desktop.yml) tạo bộ cài Windows x64 (`.exe`) và macOS cho Apple Silicon, Intel (`.dmg`). Cũng có thể chạy thủ công từ tab **Actions** → **Build desktop installers** → **Run workflow**. Sau khi cả ba job hoàn tất, tải file ZIP tương ứng trong mục **Artifacts** của lần chạy đó và giải nén để lấy bộ cài.

Các bản macOS được ký ad-hoc để tránh lỗi ứng dụng bị báo hỏng khi tải về. Chúng chưa được ký bằng chứng chỉ Developer ID hoặc notarize; để phát hành công khai không bị cảnh báo bảo mật, cần bổ sung bước ký và notarize. Bộ cài Windows hiện chưa được ký số.
