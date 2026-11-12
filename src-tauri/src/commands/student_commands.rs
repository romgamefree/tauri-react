use tauri::State;

use crate::{
    commands::run_command, database::sqlite::SqliteDatabase, models::student::Student,
    services::student_service,
};

#[tauri::command]
pub fn list_students(state: State<'_, SqliteDatabase>) -> Result<Vec<Student>, String> {
    run_command(state, "students", "list", student_service::list)
}

#[tauri::command]
pub fn save_student(
    state: State<'_, SqliteDatabase>,
    student: Student,
) -> Result<Vec<Student>, String> {
    run_command(state, "students", "save", |conn| {
        student_service::save(conn, student)
    })
}

#[tauri::command]
pub fn delete_students(
    state: State<'_, SqliteDatabase>,
    ids: Vec<String>,
) -> Result<Vec<Student>, String> {
    run_command(state, "students", "delete", |conn| {
        student_service::delete(conn, &ids)
    })
}
