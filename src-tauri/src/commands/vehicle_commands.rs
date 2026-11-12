use tauri::State;

use crate::{
    commands::run_command, database::sqlite::SqliteDatabase, models::vehicle::Vehicle,
    services::vehicle_service,
};

#[tauri::command]
pub fn list_vehicles(state: State<'_, SqliteDatabase>) -> Result<Vec<Vehicle>, String> {
    run_command(state, "vehicles", "list", vehicle_service::list)
}

#[tauri::command]
pub fn save_vehicle(
    state: State<'_, SqliteDatabase>,
    vehicle: Vehicle,
) -> Result<Vec<Vehicle>, String> {
    run_command(state, "vehicles", "save", |conn| {
        vehicle_service::save(conn, vehicle)
    })
}

#[tauri::command]
pub fn delete_vehicles(
    state: State<'_, SqliteDatabase>,
    ids: Vec<String>,
) -> Result<Vec<Vehicle>, String> {
    run_command(state, "vehicles", "delete", |conn| {
        vehicle_service::delete(conn, &ids)
    })
}
