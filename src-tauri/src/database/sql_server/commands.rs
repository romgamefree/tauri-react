use tauri::AppHandle;

use crate::error::{AppError, AppResult};

use super::{
    config_store, connection,
    models::{SavedSqlServerConnection, SqlServerInput},
};

fn command_result<T>(operation: &str, result: AppResult<T>) -> Result<T, String> {
    result.map_err(|error| {
        tracing::warn!(operation, error = %error, "SQL Server command failed");
        error.to_string()
    })
}

#[tauri::command]
pub fn load_sql_server_connection(app: AppHandle) -> Result<SavedSqlServerConnection, String> {
    command_result("load", config_store::load(&app))
}

#[tauri::command]
pub fn save_sql_server_connection(app: AppHandle, settings: SqlServerInput) -> Result<(), String> {
    command_result(
        "save",
        (|| {
            settings.connection.validate()?;
            config_store::save(&app, &settings.connection, &settings.password)
        })(),
    )
}

#[tauri::command]
pub async fn test_sql_server_connection(settings: SqlServerInput) -> Result<(), String> {
    let result = async {
        settings.connection.validate()?;
        let password = if settings.password.is_empty() {
            tauri::async_runtime::spawn_blocking(config_store::saved_password)
                .await
                .map_err(|error| AppError::BackgroundTask(error.to_string()))??
                .ok_or(AppError::MissingSqlServerPassword)?
        } else {
            settings.password
        };
        connection::test(settings.connection, password).await
    }
    .await;
    command_result("test", result)
}
