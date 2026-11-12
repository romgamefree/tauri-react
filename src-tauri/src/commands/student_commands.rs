use tauri::State;

use crate::{commands::run_command, database::Database, models::student::Student, services::student_service};

#[tauri::command]
pub fn list_students(state: State<'_, Database>) -> Result<Vec<Student>, String> {
    run_command(state, "students", "list", student_service::list)
}

#[tauri::command]
pub fn save_student(state: State<'_, Database>, student: Student) -> Result<Vec<Student>, String> {
    run_command(state, "students", "save", |conn| student_service::save(conn, student))
}

#[tauri::command]
pub fn delete_students(state: State<'_, Database>, ids: Vec<String>) -> Result<Vec<Student>, String> {
    run_command(state, "students", "delete", |conn| student_service::delete(conn, &ids))
}
