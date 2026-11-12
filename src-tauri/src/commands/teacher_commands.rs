use tauri::State;

use crate::{commands::run_command, database::Database, models::teacher::Teacher, services::teacher_service};

#[tauri::command]
pub fn list_teachers(state: State<'_, Database>) -> Result<Vec<Teacher>, String> {
    run_command(state, "teachers", "list", teacher_service::list)
}

#[tauri::command]
pub fn save_teacher(state: State<'_, Database>, teacher: Teacher) -> Result<Vec<Teacher>, String> {
    run_command(state, "teachers", "save", |conn| teacher_service::save(conn, teacher))
}

#[tauri::command]
pub fn delete_teachers(state: State<'_, Database>, ids: Vec<String>) -> Result<Vec<Teacher>, String> {
    run_command(state, "teachers", "delete", |conn| teacher_service::delete(conn, &ids))
}
