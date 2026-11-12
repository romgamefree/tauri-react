use tauri::State;

use crate::{
    database::Database,
    error::AppError,
    services::seed_service::{self, SeedData, SeedResult},
};

#[tauri::command]
pub fn seed_database(state: State<'_, Database>, data: SeedData) -> Result<SeedResult, String> {
    let result = (|| {
        let mut conn = state.0.lock()
            .map_err(|error| AppError::DatabaseLock(error.to_string()))?;
        seed_service::seed(&mut conn, data)
    })();
    result.map_err(|error| {
        tracing::warn!(error = %error, "database seed failed");
        error.to_string()
    })
}
