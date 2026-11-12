use tauri::State;

use crate::{
    commands::run_command,
    database::sqlite::SqliteDatabase,
    services::seed_service::{self, SeedData, SeedResult},
};

#[tauri::command]
pub fn seed_database(
    state: State<'_, SqliteDatabase>,
    data: SeedData,
) -> Result<SeedResult, String> {
    run_command(state, "database", "seed", |conn| {
        seed_service::seed(conn, data)
    })
}
