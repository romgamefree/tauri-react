mod commands;
mod database;
mod error;
mod models;
mod repositories;
mod services;

use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let _ = tracing_subscriber::fmt()
        .with_env_filter(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| tracing_subscriber::EnvFilter::new("react=info,warn")),
        )
        .try_init();

    tauri::Builder::default()
        .setup(|app| {
            app.manage(database::sqlite::open(app.handle())?);
            tracing::info!("SQLite database initialized");
            Ok(())
        })
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            commands::student_commands::list_students,
            commands::student_commands::save_student,
            commands::student_commands::delete_students,
            commands::teacher_commands::list_teachers,
            commands::teacher_commands::save_teacher,
            commands::teacher_commands::delete_teachers,
            commands::vehicle_commands::list_vehicles,
            commands::vehicle_commands::save_vehicle,
            commands::vehicle_commands::delete_vehicles,
            commands::course_commands::list_courses,
            commands::course_commands::save_course,
            commands::course_commands::delete_courses,
            commands::seed_commands::seed_database,
            database::sql_server::commands::load_sql_server_connection,
            database::sql_server::commands::save_sql_server_connection,
            database::sql_server::commands::test_sql_server_connection
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
