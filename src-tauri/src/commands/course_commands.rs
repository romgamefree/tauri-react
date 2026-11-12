use tauri::State;

use crate::{commands::run_command, database::Database, models::course::Course, services::course_service};

#[tauri::command]
pub fn list_courses(state: State<'_, Database>) -> Result<Vec<Course>, String> {
    run_command(state, "courses", "list", course_service::list)
}

#[tauri::command]
pub fn save_course(state: State<'_, Database>, course: Course) -> Result<Vec<Course>, String> {
    run_command(state, "courses", "save", |conn| course_service::save(conn, course))
}

#[tauri::command]
pub fn delete_courses(state: State<'_, Database>, ids: Vec<String>) -> Result<Vec<Course>, String> {
    run_command(state, "courses", "delete", |conn| course_service::delete(conn, &ids))
}
