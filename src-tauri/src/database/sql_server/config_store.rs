use std::{fs, path::PathBuf};

use keyring::v1::Entry;
use tauri::{AppHandle, Manager};

use crate::error::{AppError, AppResult};

use super::models::{SavedSqlServerConnection, SqlServerConnection};

const KEYRING_SERVICE: &str = "DrivePro SQL Server";
const KEYRING_ACCOUNT: &str = "connection-password";

fn settings_path(app: &AppHandle) -> AppResult<PathBuf> {
    Ok(app
        .path()
        .app_config_dir()
        .map_err(|error| AppError::ConfigPath(error.to_string()))?
        .join("sql-server.json"))
}

fn password_entry() -> AppResult<Entry> {
    Entry::new(KEYRING_SERVICE, KEYRING_ACCOUNT).map_err(AppError::CredentialStore)
}

pub fn saved_password() -> AppResult<Option<String>> {
    match password_entry()?.get_password() {
        Ok(password) if !password.is_empty() => Ok(Some(password)),
        Ok(_) | Err(keyring::Error::NoEntry) => Ok(None),
        Err(error) => Err(AppError::CredentialStore(error)),
    }
}

pub fn load(app: &AppHandle) -> AppResult<SavedSqlServerConnection> {
    let path = settings_path(app)?;
    let settings = read_settings(&path)?;
    Ok(SavedSqlServerConnection {
        settings,
        has_password: saved_password()?.is_some(),
    })
}

fn read_settings(path: &PathBuf) -> AppResult<Option<SqlServerConnection>> {
    let backup = path.with_extension("json.bak");
    let source = if path.exists() {
        Some(path.clone())
    } else if backup.exists() {
        Some(backup)
    } else {
        None
    };
    source
        .map(|path| {
            let data = fs::read(path).map_err(AppError::ConfigRead)?;
            serde_json::from_slice::<SqlServerConnection>(&data).map_err(AppError::Serialization)
        })
        .transpose()
}

pub fn save(app: &AppHandle, settings: &SqlServerConnection, password: &str) -> AppResult<()> {
    // Preserve the previous configuration if the credential store is unavailable.
    if !password.is_empty() {
        password_entry()?
            .set_password(password)
            .map_err(AppError::CredentialStore)?;
    }

    write_settings(&settings_path(app)?, settings)
}

fn write_settings(path: &PathBuf, settings: &SqlServerConnection) -> AppResult<()> {
    let parent = path
        .parent()
        .ok_or(AppError::ConfigPath("Đường dẫn không hợp lệ".into()))?;
    fs::create_dir_all(parent).map_err(AppError::ConfigWrite)?;
    let backup = path.with_extension("json.bak");
    let temporary = path.with_extension("json.tmp");

    // Recover a previous interrupted save before replacing the active file.
    if !path.exists() && backup.exists() {
        fs::rename(&backup, &path).map_err(AppError::ConfigWrite)?;
    }
    let data = serde_json::to_vec_pretty(settings)?;
    fs::write(&temporary, data).map_err(AppError::ConfigWrite)?;
    if path.exists() {
        if backup.exists() {
            fs::remove_file(&backup).map_err(AppError::ConfigWrite)?;
        }
        fs::rename(&path, &backup).map_err(AppError::ConfigWrite)?;
    }
    if let Err(error) = fs::rename(&temporary, &path) {
        if backup.exists() {
            let _ = fs::rename(&backup, &path);
        }
        return Err(AppError::ConfigWrite(error));
    }
    if backup.exists() {
        let _ = fs::remove_file(backup);
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::time::{SystemTime, UNIX_EPOCH};

    #[test]
    fn config_is_recovered_from_backup_and_never_contains_password() {
        let nonce = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_nanos();
        let directory = std::env::temp_dir().join(format!(
            "drivepro-config-test-{}-{nonce}",
            std::process::id()
        ));
        fs::create_dir_all(&directory).unwrap();
        let path = directory.join("sql-server.json");
        let settings = SqlServerConnection {
            host: "sql.example.com".into(),
            port: 1433,
            database: "Training".into(),
            username: "login".into(),
            trust_server_certificate: false,
        };
        write_settings(&path, &settings).unwrap();
        let contents = fs::read_to_string(&path).unwrap();
        assert!(!contents.contains("password"));
        assert_eq!(read_settings(&path).unwrap().unwrap().database, "Training");

        fs::rename(&path, path.with_extension("json.bak")).unwrap();
        assert_eq!(
            read_settings(&path).unwrap().unwrap().host,
            "sql.example.com"
        );
        write_settings(&path, &settings).unwrap();
        assert!(path.exists());
        assert!(!path.with_extension("json.bak").exists());
        fs::remove_dir_all(directory).unwrap();
    }
}
