use thiserror::Error;

pub type AppResult<T> = Result<T, AppError>;

#[derive(Debug, Error)]
pub enum AppError {
    #[error("Danh mục không hợp lệ.")]
    InvalidEntity,
    #[error("Mã hoặc biển số không được để trống.")]
    MissingIdentifier,
    #[error("ID không được để trống.")]
    MissingId,
    #[error("{0} không được để trống.")]
    MissingField(&'static str),
    #[error("Mã hoặc biển số đã tồn tại trong danh mục.")]
    DuplicateIdentifier,
    #[error("Lỗi cơ sở dữ liệu: {0}")]
    Database(rusqlite::Error),
    #[error("Dữ liệu không hợp lệ: {0}")]
    Serialization(#[from] serde_json::Error),
    #[error("Không thể truy cập cơ sở dữ liệu: {0}")]
    DatabaseLock(String),
    #[error("Cấu hình SQL Server không hợp lệ: {0}")]
    InvalidSqlServerSettings(&'static str),
    #[error("Không tìm được thư mục cấu hình: {0}")]
    ConfigPath(String),
    #[error("Không thể chạy tác vụ nền: {0}")]
    BackgroundTask(String),
    #[error("Không đọc được cấu hình SQL Server: {0}")]
    ConfigRead(#[source] std::io::Error),
    #[error("Không lưu được cấu hình SQL Server: {0}")]
    ConfigWrite(#[source] std::io::Error),
    #[error("Không truy cập được kho mật khẩu hệ điều hành: {0}")]
    CredentialStore(#[source] keyring::Error),
    #[error("Chưa có mật khẩu đã lưu. Hãy nhập mật khẩu SQL Server.")]
    MissingSqlServerPassword,
    #[error("Không kết nối được đến máy chủ: {0}")]
    SqlServerTransport(#[source] std::io::Error),
    #[error("SQL Server từ chối kết nối: {0}")]
    SqlServerProtocol(#[source] tiberius::error::Error),
    #[error("Hết thời gian chờ kết nối SQL Server (10 giây).")]
    SqlServerTimeout,
}

impl From<rusqlite::Error> for AppError {
    fn from(error: rusqlite::Error) -> Self {
        match &error {
            rusqlite::Error::SqliteFailure(details, _)
                if details.code == rusqlite::ErrorCode::ConstraintViolation =>
            {
                Self::DuplicateIdentifier
            }
            _ => Self::Database(error),
        }
    }
}
