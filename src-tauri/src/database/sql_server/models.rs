use serde::{Deserialize, Serialize};

use crate::error::{AppError, AppResult};

#[derive(Clone, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SqlServerConnection {
    pub host: String,
    pub port: u16,
    pub database: String,
    pub username: String,
    pub trust_server_certificate: bool,
}

impl SqlServerConnection {
    pub fn validate(&self) -> AppResult<()> {
        if self.host.trim().is_empty() || self.host.contains(['/', '\\', ':']) {
            return Err(AppError::InvalidSqlServerSettings(
                "Máy chủ phải là tên máy hoặc địa chỉ IP, không kèm cổng.",
            ));
        }
        if self.port == 0 {
            return Err(AppError::InvalidSqlServerSettings(
                "Cổng phải nằm trong khoảng 1–65535.",
            ));
        }
        if self.database.trim().is_empty() {
            return Err(AppError::InvalidSqlServerSettings(
                "Tên cơ sở dữ liệu không được để trống.",
            ));
        }
        if self.username.trim().is_empty() {
            return Err(AppError::InvalidSqlServerSettings(
                "Tên đăng nhập không được để trống.",
            ));
        }
        Ok(())
    }
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SqlServerInput {
    #[serde(flatten)]
    pub connection: SqlServerConnection,
    pub password: String,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SavedSqlServerConnection {
    pub settings: Option<SqlServerConnection>,
    pub has_password: bool,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn rejects_incomplete_connection_settings() {
        let mut settings = SqlServerConnection {
            host: "localhost".into(),
            port: 1433,
            database: "Training".into(),
            username: "login".into(),
            trust_server_certificate: false,
        };
        assert!(settings.validate().is_ok());
        settings.port = 0;
        assert!(settings.validate().is_err());
        settings.port = 1433;
        settings.host = "localhost:1433".into();
        assert!(settings.validate().is_err());
        settings.host = "localhost".into();
        settings.database.clear();
        assert!(settings.validate().is_err());
    }
}
