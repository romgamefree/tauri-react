use rusqlite::Connection;

use crate::{
    error::{AppError, AppResult},
    models::{course::Course, student::Student, teacher::Teacher, vehicle::Vehicle},
    repositories::{course_repository, student_repository, teacher_repository, vehicle_repository},
};

pub(super) fn migrate(conn: &mut Connection) -> AppResult<()> {
    let version: i64 = conn.pragma_query_value(None, "user_version", |row| row.get(0))?;
    if version >= 2 {
        return Ok(());
    }

    let tx = conn.transaction()?;
    tx.execute_batch(include_str!(
        "../../../migrations/0001_create_domain_tables.sql"
    ))?;
    let has_legacy_table: bool = tx.query_row(
        "SELECT EXISTS(SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = 'records')",
        [],
        |row| row.get(0),
    )?;
    if has_legacy_table {
        let legacy: Vec<(String, String)> = {
            let mut statement =
                tx.prepare("SELECT entity, payload FROM records ORDER BY position ASC")?;
            let rows = statement.query_map([], |row| Ok((row.get(0)?, row.get(1)?)))?;
            rows.collect::<Result<Vec<_>, _>>()?
        };
        for (entity, payload) in legacy {
            match entity.as_str() {
                "students" => {
                    student_repository::insert(&tx, &serde_json::from_str::<Student>(&payload)?)?
                }
                "teachers" => {
                    teacher_repository::insert(&tx, &serde_json::from_str::<Teacher>(&payload)?)?
                }
                "vehicles" => {
                    vehicle_repository::insert(&tx, &serde_json::from_str::<Vehicle>(&payload)?)?
                }
                "courses" => {
                    course_repository::insert(&tx, &serde_json::from_str::<Course>(&payload)?)?
                }
                _ => return Err(AppError::InvalidEntity),
            }
        }
        // Keep original payloads in existing installations, including custom fields.
        tx.execute_batch("ALTER TABLE records RENAME TO legacy_records_backup;")?;
    }
    tx.pragma_update(None, "user_version", 2)?;
    tx.commit()?;
    Ok(())
}
