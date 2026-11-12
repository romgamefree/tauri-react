pub mod course_commands;
pub mod seed_commands;
pub mod student_commands;
pub mod teacher_commands;
pub mod vehicle_commands;

use rusqlite::Connection;
use tauri::State;

use crate::{database::sqlite::SqliteDatabase, error::AppResult};

pub fn run_command<T>(
    state: State<'_, SqliteDatabase>,
    entity: &str,
    operation: &str,
    action: impl FnOnce(&mut Connection) -> AppResult<T>,
) -> Result<T, String> {
    let result = state.with_connection(action);
    match result {
        Ok(value) => {
            tracing::debug!(entity, operation, "command completed");
            Ok(value)
        }
        Err(error) => {
            tracing::warn!(entity, operation, error = %error, "command failed");
            Err(error.to_string())
        }
    }
}
