use std::{fs, path::PathBuf, time::Duration};

use keyring::v1::Entry;
use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Manager};
use tiberius::{AuthMethod, Client, Config};
use tokio::{net::TcpStream, time::timeout};
use tokio_util::compat::TokioAsyncWriteCompatExt;

const KEYRING_SERVICE: &str = "DrivePro SQL Server";
const KEYRING_ACCOUNT: &str = "connection-password";

#[derive(Clone, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SqlServerConnection {
    host: String,
    port: u16,
    database: String,
    username: String,
    trust_server_certificate: bool,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SqlServerInput {
    #[serde(flatten)]
    connection: SqlServerConnection,
    password: String,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SavedSqlServerConnection {
    settings: Option<SqlServerConnection>,
    has_password: bool,
}

fn settings_path(app: &AppHandle) -> Result<PathBuf, String> {
    Ok(app
        .path()
        .app_config_dir()
        .map_err(|error| format!("Không tìm được thư mục cấu hình: {error}"))?
        .join("sql-server.json"))
}

fn password_entry() -> Result<Entry, String> {
    Entry::new(KEYRING_SERVICE, KEYRING_ACCOUNT)
        .map_err(|error| format!("Không mở được kho mật khẩu hệ điều hành: {error}"))
}

fn validate(settings: &SqlServerConnection) -> Result<(), String> {
    if settings.host.trim().is_empty() || settings.host.contains(['/', '\\', ':']) {
        return Err("Máy chủ SQL Server không hợp lệ. Hãy nhập tên máy hoặc địa chỉ IP, không kèm cổng.".into());
    }
    if settings.port == 0 {
        return Err("Cổng phải nằm trong khoảng 1–65535.".into());
    }
    if settings.database.trim().is_empty() {
        return Err("Tên cơ sở dữ liệu không được để trống.".into());
    }
    if settings.username.trim().is_empty() {
        return Err("Tên đăng nhập không được để trống.".into());
    }
    Ok(())
}

#[tauri::command]
pub fn load_sql_server_connection(app: AppHandle) -> Result<SavedSqlServerConnection, String> {
    let path = settings_path(&app)?;
    let settings = if path.exists() {
        let data = fs::read(path).map_err(|error| format!("Không đọc được cấu hình SQL Server: {error}"))?;
        Some(serde_json::from_slice(&data).map_err(|error| format!("Cấu hình SQL Server không hợp lệ: {error}"))?)
    } else {
        None
    };
    let has_password = password_entry()
        .ok()
        .and_then(|entry| entry.get_password().ok())
        .is_some_and(|password| !password.is_empty());
    Ok(SavedSqlServerConnection { settings, has_password })
}

#[tauri::command]
pub fn save_sql_server_connection(app: AppHandle, settings: SqlServerInput) -> Result<(), String> {
    validate(&settings.connection)?;
    if !settings.password.is_empty() {
        password_entry()?
            .set_password(&settings.password)
            .map_err(|error| format!("Không lưu được mật khẩu vào hệ điều hành: {error}"))?;
    }

    let path = settings_path(&app)?;
    let parent = path.parent().ok_or("Đường dẫn cấu hình không hợp lệ.")?;
    fs::create_dir_all(parent).map_err(|error| format!("Không tạo được thư mục cấu hình: {error}"))?;
    let data = serde_json::to_vec_pretty(&settings.connection)
        .map_err(|error| format!("Không mã hóa được cấu hình: {error}"))?;
    fs::write(path, data).map_err(|error| format!("Không lưu được cấu hình: {error}"))?;
    Ok(())
}

#[tauri::command]
pub async fn test_sql_server_connection(settings: SqlServerInput) -> Result<(), String> {
    validate(&settings.connection)?;
    let password = if settings.password.is_empty() {
        tauri::async_runtime::spawn_blocking(|| password_entry()?.get_password()
            .map_err(|_| "Chưa có mật khẩu đã lưu. Hãy nhập mật khẩu SQL Server.".to_string()))
            .await
            .map_err(|error| format!("Không đọc được mật khẩu: {error}"))??
    } else {
        settings.password
    };

    let connection = settings.connection;
    let mut config = Config::new();
    config.host(connection.host.trim());
    config.port(connection.port);
    config.database(connection.database.trim());
    config.authentication(AuthMethod::sql_server(connection.username.trim(), password));
    if connection.trust_server_certificate {
        config.trust_cert();
    }

    timeout(Duration::from_secs(10), async {
        let tcp = TcpStream::connect(config.get_addr())
            .await
            .map_err(|error| format!("Không kết nối được đến máy chủ: {error}"))?;
        tcp.set_nodelay(true)
            .map_err(|error| format!("Không cấu hình được kết nối: {error}"))?;
        Client::connect(config, tcp.compat_write())
            .await
            .map_err(|error| format!("SQL Server từ chối kết nối: {error}"))?;
        Ok(())
    })
    .await
    .map_err(|_| "Hết thời gian chờ kết nối SQL Server (10 giây).".to_string())?
}
