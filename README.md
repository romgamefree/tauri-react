# DrivePro — hướng dẫn cho người mới vào dự án

DrivePro là ứng dụng desktop quản lý đào tạo lái xe bằng **Tauri 2, React, TypeScript và Rust**. Giao diện dùng shadcn/ui, Tailwind CSS và TanStack Table. Dữ liệu chính nằm trong **SQLite cục bộ**. Phần **SQL Server bên thứ ba** hiện chỉ có cấu hình và chức năng thử kết nối; hai nguồn dữ liệu độc lập.

> Nếu bạn là dev Java và chưa biết Rust, hãy đọc mục [Luồng lưu giáo viên](#luồng-lưu-giáo-viên) trước. Bạn không cần học toàn bộ Rust mới sửa được một chức năng CRUD.

## Chạy dự án

CI dùng Node.js 22 và Rust stable. Sau khi cài Node.js, npm, Rust và công cụ build desktop cho hệ điều hành của mình, chạy tại thư mục gốc:

```bash
npm ci
npm run tauri dev
```

Lệnh này chạy Vite tại `http://localhost:1420` và mở cửa sổ Tauri. Dùng **cửa sổ desktop** để thử CRUD. `npm run dev` chỉ chạy giao diện trong trình duyệt; trình duyệt không có backend Tauri nên không đọc/ghi được database.

Các lệnh kiểm tra:

```bash
npm run build
cargo test --manifest-path src-tauri/Cargo.toml
cargo check --manifest-path src-tauri/Cargo.toml
cargo fmt --manifest-path src-tauri/Cargo.toml --check
```

`.env` cung cấp `APP_NAME` và `APP_LICENSE` cho tên và dòng license trong sidebar. Chúng được đóng gói vào frontend, **không phải bí mật hoặc cơ chế xác thực license**.

## Công nghệ và thư viện đang dùng

Phiên bản chính xác nằm trong [package.json](./package.json), [package-lock.json](./package-lock.json), [Cargo.toml](./src-tauri/Cargo.toml) và [Cargo.lock](./src-tauri/Cargo.lock). Bảng dưới giải thích **vai trò trong dự án này**, không phải toàn bộ tính năng của từng thư viện.

### Giao diện và công cụ build

| Công nghệ / thư viện | Dùng để làm gì trong DrivePro? |
| --- | --- |
| **React + React DOM** | Xây các trang, component và quản lý trạng thái giao diện. Điểm vào là [main.tsx](./src/main.tsx). |
| **TypeScript** | Kiểm tra kiểu dữ liệu frontend, ví dụ `Teacher` trong [types/teacher.ts](./src/types/teacher.ts). `npm run build` chạy `tsc` trước khi đóng gói. |
| **Vite + `@vitejs/plugin-react`** | Chạy dev server, biên dịch frontend và hỗ trợ React; cấu hình ở [vite.config.ts](./vite.config.ts). |
| **Tailwind CSS + `@tailwindcss/vite`** | Tạo giao diện bằng utility class; theme và các biến màu nằm ở [index.css](./src/index.css). |
| **shadcn/ui + `@base-ui/react`** | Các component UI nằm trong source tại [components/ui/](./src/components/ui/); Base UI cung cấp primitive/hành vi cho button, dialog, popover, input… `shadcn` còn được cài để quản lý/thêm component. |
| **TanStack Table** | Logic bảng dữ liệu: sắp xếp, lọc, chọn dòng, cột và phân trang trong [catalog/data-table.tsx](./src/features/catalog/data-table.tsx). |
| **`react-day-picker` + `date-fns`** | Lịch chọn ngày và xử lý/định dạng ngày trong [calendar.tsx](./src/components/ui/calendar.tsx) và [date-time-field.tsx](./src/components/date-time-field.tsx). |
| **Lucide React** | Icon của sidebar, trang và nút thao tác. |
| **`class-variance-authority` + `cn`** | Khai báo các biến thể component và ghép class Tailwind, ví dụ trong [button.tsx](./src/components/ui/button.tsx). |
| **`tw-animate-css` + Geist font** | Hiệu ứng CSS và font giao diện, được import trong [index.css](./src/index.css). |
| **`@tauri-apps/api`** | Gọi Rust command từ React qua `invoke`; xem [database-invoke.ts](./src/services/database-invoke.ts). |
| **`@tauri-apps/cli`** | Lệnh `npm run tauri dev` và `npm run tauri build`. |
| **`@types/react`, `@types/react-dom`, `@types/node`** | Khai báo kiểu cho TypeScript; không phải thư viện nghiệp vụ chạy trong app. |

### Backend Rust và desktop

| Crate | Dùng để làm gì trong DrivePro? |
| --- | --- |
| **`tauri` + `tauri-build`** | Tạo ứng dụng desktop, quản lý state, khai báo command và đóng gói; khởi tạo trong [lib.rs](./src-tauri/src/lib.rs). |
| **`tauri-plugin-opener`** | Plugin mở tài nguyên bằng ứng dụng mặc định của hệ điều hành; được đăng ký trong [lib.rs](./src-tauri/src/lib.rs). |
| **`serde` + `serde_json`** | Chuyển dữ liệu Rust ↔ JSON cho React, cấu hình SQL Server và dữ liệu migration cũ; ví dụ [models/teacher.rs](./src-tauri/src/models/teacher.rs). |
| **`rusqlite`** | Truy cập SQLite bằng SQL viết trực tiếp trong các [repository](./src-tauri/src/repositories/). Tùy chọn `bundled` mang theo SQLite khi build. |
| **`tiberius`** | Kết nối trực tiếp SQL Server bằng TDS; hiện dùng để thử kết nối trong [sql_server/connection.rs](./src-tauri/src/database/sql_server/connection.rs). Cấu hình bật TLS qua `rustls`. |
| **`tokio` + `tokio-util`** | Kết nối TCP bất đồng bộ, timeout và chuyển kiểu stream cho Tiberius trong [sql_server/connection.rs](./src-tauri/src/database/sql_server/connection.rs). |
| **`keyring`** | Lưu/đọc mật khẩu SQL Server bằng kho thông tin đăng nhập của hệ điều hành trong [sql_server/config_store.rs](./src-tauri/src/database/sql_server/config_store.rs). |
| **`thiserror`** | Định nghĩa lỗi backend có kiểu và thông báo dễ hiểu trong [error.rs](./src-tauri/src/error.rs). |
| **`tracing` + `tracing-subscriber`** | Ghi log của command và cấu hình mức log trong [lib.rs](./src-tauri/src/lib.rs). |

Dự án **không dùng ORM hoặc `sqlx`**: CRUD SQLite hiện viết bằng `rusqlite`, còn SQL Server là một kết nối riêng. Giao diện gọi Rust bằng Tauri IPC, không có HTTP API backend.

## Bản đồ source

Cây thư mục chính (lược bớt các file UI, icon và file được tạo khi build):

```text
react/
├── .github/
│   └── workflows/
│       └── build-desktop.yml          # Build bộ cài macOS và Windows
├── src/                               # React + TypeScript
│   ├── app/
│   │   └── app.tsx                    # Chọn trang đang hiển thị
│   ├── components/
│   │   ├── app-sidebar.tsx
│   │   ├── date-time-field.tsx
│   │   └── ui/                        # Thành phần shadcn/ui
│   ├── features/
│   │   ├── catalog/                   # Bảng, form, dialog, hook CRUD dùng chung
│   │   ├── students/                  # Cấu hình và seed học viên
│   │   ├── teachers/                  # Cấu hình và seed giáo viên
│   │   ├── vehicles/                  # Cấu hình và seed xe
│   │   └── courses/                   # Cấu hình và seed khóa học
│   ├── hooks/                         # Hook giao diện dùng chung
│   ├── layouts/
│   │   └── app-layout.tsx
│   ├── lib/                           # Tiện ích frontend
│   ├── pages/                         # Mỗi danh mục và SQL Server một trang
│   ├── services/                      # Gọi Tauri command từ React
│   ├── stores/                        # Trạng thái giao diện
│   ├── types/                         # Kiểu dữ liệu TypeScript
│   ├── index.css                      # Tailwind và theme
│   └── main.tsx                       # Điểm vào React
├── src-tauri/                         # Backend Rust và cấu hình desktop
│   ├── capabilities/                  # Quyền của cửa sổ Tauri
│   ├── icons/                         # Icon bộ cài
│   ├── migrations/
│   │   └── 0001_create_domain_tables.sql
│   ├── src/
│   │   ├── commands/                   # Lệnh CRUD/seed nhận từ React
│   │   │   ├── student_commands.rs
│   │   │   ├── teacher_commands.rs
│   │   │   ├── vehicle_commands.rs
│   │   │   ├── course_commands.rs
│   │   │   └── seed_commands.rs
│   │   ├── database/
│   │   │   ├── sqlite/                # Mở DB, migration, test SQLite
│   │   │   │   ├── mod.rs
│   │   │   │   ├── migrations.rs
│   │   │   │   └── tests.rs
│   │   │   └── sql_server/            # Cấu hình và thử kết nối SQL Server
│   │   │       ├── commands.rs
│   │   │       ├── config_store.rs
│   │   │       ├── connection.rs
│   │   │       └── models.rs
│   │   ├── models/                    # Student, Teacher, Vehicle, Course
│   │   ├── repositories/              # SQL CRUD cho từng bảng SQLite
│   │   ├── services/                  # Nghiệp vụ CRUD và seed
│   │   ├── error.rs                   # Kiểu lỗi backend
│   │   ├── lib.rs                     # Khởi tạo và đăng ký Tauri commands
│   │   └── main.rs                    # Gọi react_lib::run()
│   ├── Cargo.toml                     # Dependency và cấu hình build Rust
│   └── tauri.conf.json                # Tên app, cửa sổ, bundle
├── .env                               # APP_NAME, APP_LICENSE cho frontend
├── components.json                    # Cấu hình shadcn/ui
├── package.json                       # Dependency và script frontend
├── requirement.md                     # Yêu cầu nghiệp vụ
└── README.md
```

Các thư mục `node_modules/`, `dist/` và `src-tauri/target/` được tạo khi cài/build, không phải nơi sửa source. Dấu `mod.rs` trong Rust khai báo các module con; bắt đầu từ `src-tauri/src/lib.rs` để lần theo những module được dùng.

| Vị trí | Vai trò |
| --- | --- |
| [src/app/](./src/app/), [src/layouts/](./src/layouts/) | Ghép trang, điều hướng và khung ứng dụng. |
| [src/pages/](./src/pages/) | Trang tổng quan và trang riêng cho từng danh mục, SQL Server. |
| [src/features/catalog/](./src/features/catalog/) | Bảng, form, dialog và hook CRUD dùng chung ở giao diện. |
| [src/features/](./src/features/) | Cấu hình trường, trạng thái và dữ liệu seed theo danh mục. |
| [src/services/](./src/services/), [src/types/](./src/types/) | Lời gọi Tauri từ React và kiểu dữ liệu TypeScript. |
| [src/components/ui/](./src/components/ui/) | Thành phần shadcn/ui dùng chung. |
| [src-tauri/src/lib.rs](./src-tauri/src/lib.rs) | Khởi tạo app, mở SQLite và đăng ký Tauri command. |
| [src-tauri/src/commands/](./src-tauri/src/commands/) | Điểm vào CRUD và seed từ React. |
| [src-tauri/src/services/](./src-tauri/src/services/) | Kiểm tra đầu vào, xử lý nghiệp vụ và transaction. |
| [src-tauri/src/repositories/](./src-tauri/src/repositories/) | Câu SQL cho từng bảng SQLite. |
| [src-tauri/src/models/](./src-tauri/src/models/) | Kiểu dữ liệu Rust gửi/nhận qua Tauri. |
| [src-tauri/src/database/sqlite/](./src-tauri/src/database/sqlite/) | Mở SQLite, migration, test dữ liệu. |
| [src-tauri/src/database/sql_server/](./src-tauri/src/database/sql_server/) | Cấu hình, mật khẩu và kết nối SQL Server. |
| [src-tauri/migrations/](./src-tauri/migrations/) | SQL tạo/nâng cấp bảng SQLite. |

Hiện có bốn danh mục CRUD: **học viên, giáo viên, xe đào tạo, khóa học**. Chúng dùng chung các thành phần bảng/form React, nhưng có trang, service frontend, model, service và repository backend riêng.

## Luồng lưu giáo viên

```text
Giao diện giáo viên
  → teacherService.save()
  → invoke("save_teacher", { teacher })
  → Tauri save_teacher()
  → run_command() lấy kết nối SQLite
  → teacher_service::save() kiểm tra dữ liệu và mở transaction
  → teacher_repository::insert() hoặc update() chạy SQL
  → SQLite → trả danh sách giáo viên mới về React
```

Đọc theo thứ tự để thấy toàn bộ luồng:

1. [teachers-page.tsx](./src/pages/teachers-page.tsx) hiển thị trang và gọi hook CRUD.
2. [use-entity.ts](./src/features/catalog/use-entity.ts) quản lý tải, lưu, xóa và thông báo.
3. [teacher-service.ts](./src/services/teacher-service.ts) tạo đối tượng `Teacher`, tạo ID khi thêm mới và gọi command.
4. [teacher_commands.rs](./src-tauri/src/commands/teacher_commands.rs) nhận dữ liệu từ React. `#[tauri::command]` gần giống một controller endpoint, nhưng giao tiếp bằng Tauri IPC thay vì HTTP.
5. [commands/mod.rs](./src-tauri/src/commands/mod.rs) khóa kết nối SQLite, ghi log và đổi lỗi trả về giao diện.
6. [teacher_service.rs](./src-tauri/src/services/teacher_service.rs) kiểm tra dữ liệu, gán ngày cập nhật, chọn thêm/sửa theo ID và commit transaction.
7. [teacher_repository.rs](./src-tauri/src/repositories/teacher_repository.rs) chứa các câu `SELECT`, `INSERT`, `UPDATE`, `DELETE`.
8. [teacher.rs](./src-tauri/src/models/teacher.rs) định nghĩa kiểu dữ liệu Rust. `serde(rename_all = "camelCase")` chuyển `full_name` trong Rust thành `fullName` khi trao đổi JSON với TypeScript.

`save_teacher` dùng chung cho thêm và sửa. Frontend tạo ID mới bằng `crypto.randomUUID()`; backend kiểm tra ID có tồn tại để chọn `INSERT` hay `UPDATE`. Sau khi lưu hoặc xóa, backend trả lại **toàn bộ danh sách** để frontend cập nhật bảng.

### Bảng dịch nhanh cho dev Java

| Rust trong code | Có thể hiểu như |
| --- | --- |
| `struct Teacher` | DTO/POJO. |
| `#[tauri::command]` | Điểm vào gần giống controller method; dùng IPC, không dùng HTTP. |
| Service / repository | Service / DAO. |
| `Vec<Teacher>` | `List<Teacher>`. |
| `Result<T, E>` | Thành công kiểu `T` hoặc lỗi kiểu `E`; lỗi là giá trị cần xử lý. |
| `?` | Có lỗi thì trả lỗi lên hàm gọi ngay. |
| `&Teacher` | Mượn dữ liệu để đọc. |
| `&mut Connection` | Mượn kết nối với quyền thay đổi. |
| `|conn| { ... }` | Lambda/closure. |
| `State<'_, SqliteDatabase>` | State do Tauri quản lý; `'_` là lifetime Rust tự suy ra. |

[error.rs](./src-tauri/src/error.rs) định nghĩa `AppError` và `AppResult<T>`. Bên trong backend trả lỗi có kiểu; ở ranh giới Tauri command, lỗi được đổi thành chuỗi cho React hiển thị. Khi mới đọc source, hãy tập trung vào luồng gọi và kiểu dữ liệu trước, rồi học ownership qua các chỗ dùng `&` và `&mut`.

## SQLite và SQL Server không phải một database

### SQLite của DrivePro

[sqlite/mod.rs](./src-tauri/src/database/sqlite/mod.rs) mở `drivepro.sqlite3` trong **thư mục dữ liệu ứng dụng** do Tauri cung cấp; file này không nằm trong source. Schema từ [0001_create_domain_tables.sql](./src-tauri/migrations/0001_create_domain_tables.sql) có bốn bảng riêng: `students`, `teachers`, `vehicles`, `courses`.

[sqlite/migrations.rs](./src-tauri/src/database/sqlite/migrations.rs) dùng `PRAGMA user_version` để nâng cấp database. Nó chuyển dữ liệu từ bảng `records` của bản cũ và giữ payload gốc trong `legacy_records_backup`. Khi thêm cột/bảng, hãy thêm **bước migration mới**, cập nhật bộ chạy migration và test cả database mới lẫn bản cũ; đừng sửa tùy tiện migration đã phát hành.

Các trang luôn đọc từ SQLite, không dùng dữ liệu giả tự động. Nút **Seed dữ liệu** ở trang tổng quan chỉ thêm bản mẫu còn thiếu. Luồng: [seed-database-service.ts](./src/services/seed-database-service.ts) → [seed_commands.rs](./src-tauri/src/commands/seed_commands.rs) → [seed_service.rs](./src-tauri/src/services/seed_service.rs).

### SQL Server bên thứ ba

Trang [sql-server-page.tsx](./src/pages/sql-server-page.tsx) nhập cấu hình và thử kết nối. [config_store.rs](./src-tauri/src/database/sql_server/config_store.rs) lưu máy chủ/tài khoản trong `sql-server.json` ở thư mục cấu hình ứng dụng; mật khẩu nằm trong kho thông tin đăng nhập của hệ điều hành, không nằm trong JSON. [connection.rs](./src-tauri/src/database/sql_server/connection.rs) thử kết nối trực tiếp. [commands.rs](./src-tauri/src/database/sql_server/commands.rs) cung cấp ba lệnh Tauri: tải, lưu, thử kết nối.

Hiện chưa có truy vấn bảng nghiệp vụ SQL Server vì chưa có schema của bên thứ ba. Không tự đồng bộ SQL Server với SQLite; chỉ đọc/ghi SQL Server khi có nghiệp vụ cụ thể yêu cầu.

## Bắt tay làm một thay đổi

**Thêm trường cho giáo viên:**

1. Xác định trường ở [teachers/config.ts](./src/features/teachers/config.ts) và [types/teacher.ts](./src/types/teacher.ts).
2. Cập nhật dữ liệu gửi đi ở [teacher-service.ts](./src/services/teacher-service.ts).
3. Cập nhật [models/teacher.rs](./src-tauri/src/models/teacher.rs), thêm kiểm tra ở [services/teacher_service.rs](./src-tauri/src/services/teacher_service.rs) nếu cần.
4. Thêm migration mới và sửa câu SQL/ánh xạ dòng trong [teacher_repository.rs](./src-tauri/src/repositories/teacher_repository.rs).
5. Chạy test Rust và build frontend; thử thêm mới và đọc lại dữ liệu cũ.

**Thêm Tauri command:** viết hàm `#[tauri::command]`, đăng ký trong [lib.rs](./src-tauri/src/lib.rs), gọi đúng tên bằng `invoke` tại [src/services/](./src/services/). Không đặt SQL trong React.

**Sửa bảng hoặc form:** bắt đầu ở cấu hình danh mục trong [src/features/](./src/features/) rồi xem thành phần dùng chung trong [catalog/](./src/features/catalog/). Giữ các thành phần ở [src/components/ui/](./src/components/ui/) độc lập với nghiệp vụ.

## Phạm vi hiện tại và phát hành

Ứng dụng hiện tập trung vào CRUD. Phân công, lịch sử thay đổi, cảnh báo hết hạn, báo cáo và in ấn trong [requirement.md](./requirement.md) chưa có xử lý nghiệp vụ đầy đủ. SQLite cũng chưa mô hình hóa quan hệ nghiệp vụ giữa bốn danh mục.

Workflow [build-desktop.yml](./.github/workflows/build-desktop.yml) chạy khi push lên `main` hoặc khởi chạy thủ công từ tab **Actions**. Artifact gồm Windows 64-bit x64, Windows 32-bit x86, macOS Apple Silicon và macOS Intel. Tải ZIP trong mục **Artifacts** của lần chạy rồi giải nén để lấy bộ cài. Bản macOS hiện ký ad-hoc, chưa notarize; bản Windows chưa ký số, nên người dùng có thể gặp cảnh báo bảo mật khi mở bộ cài.

**Đường ngắn nhất để tiếp cận dự án:** chạy app desktop, lần theo một thao tác giáo viên từ React service đến Rust repository, sửa một trường nhỏ, rồi chạy các lệnh kiểm tra ở đầu tài liệu.
