use std::{fs, path::PathBuf, sync::Mutex};

use rusqlite::Connection;
use tauri::{AppHandle, Manager};

use crate::error::{AppError, AppResult};

mod migrations;

#[cfg(test)]
mod tests;

pub struct SqliteDatabase(Mutex<Connection>);

impl SqliteDatabase {
    pub fn with_connection<T>(
        &self,
        action: impl FnOnce(&mut Connection) -> AppResult<T>,
    ) -> AppResult<T> {
        let mut connection = self
            .0
            .lock()
            .map_err(|error| AppError::DatabaseLock(error.to_string()))?;
        action(&mut connection)
    }
}

pub fn open(app: &AppHandle) -> Result<SqliteDatabase, Box<dyn std::error::Error>> {
    let directory: PathBuf = app.path().app_data_dir()?;
    fs::create_dir_all(&directory)?;
    let mut conn = Connection::open(directory.join("drivepro.sqlite3"))?;
    migrations::migrate(&mut conn)?;
    Ok(SqliteDatabase(Mutex::new(conn)))
}

pub fn today(conn: &Connection) -> AppResult<String> {
    Ok(conn.query_row("SELECT date('now')", [], |row| row.get(0))?)
}
