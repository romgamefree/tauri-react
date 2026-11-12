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
