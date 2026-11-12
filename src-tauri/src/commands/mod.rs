pub mod student_commands;
pub mod teacher_commands;
pub mod vehicle_commands;
pub mod course_commands;
pub mod seed_commands;

use rusqlite::Connection;
use serde::Serialize;
use tauri::State;

use crate::{database::Database, error::{AppError, AppResult}};

pub fn run_command<T: Serialize>(
    state: State<'_, Database>,
    entity: &str,
    operation: &str,
    action: impl FnOnce(&mut Connection) -> AppResult<Vec<T>>,
) -> Result<Vec<T>, String> {
    let result = (|| {
        let mut conn = state.0.lock()
            .map_err(|error| AppError::DatabaseLock(error.to_string()))?;
        action(&mut conn)
    })();
    match result {
        Ok(items) => {
            tracing::debug!(entity, operation, count = items.len(), "command completed");
            Ok(items)
        }
        Err(error) => {
            tracing::warn!(entity, operation, error = %error, "command failed");
            Err(error.to_string())
        }
    }
}
