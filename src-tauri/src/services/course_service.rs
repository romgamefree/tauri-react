use rusqlite::Connection;

use crate::{
    database,
    error::{AppError, AppResult},
    models::course::Course,
    repositories::course_repository as repository,
};

pub(crate) fn validate(item: &Course) -> AppResult<()> {
    if item.id.trim().is_empty() { return Err(AppError::MissingId); }
    if item.code.trim().is_empty() { return Err(AppError::MissingIdentifier); }
    if item.name.trim().is_empty() { return Err(AppError::MissingField("Tên khóa")); }
    Ok(())
}

pub fn list(conn: &mut Connection) -> AppResult<Vec<Course>> {
    repository::list(conn)
}

pub fn save(conn: &mut Connection, mut item: Course) -> AppResult<Vec<Course>> {
    validate(&item)?;
    item.updated_at = database::today(conn)?;
    let tx = conn.transaction()?;
    if repository::exists(&tx, &item.id)? { repository::update(&tx, &item)?; }
    else { repository::insert(&tx, &item)?; }
    tx.commit()?;
    repository::list(conn)
}

pub fn delete(conn: &mut Connection, ids: &[String]) -> AppResult<Vec<Course>> {
    let tx = conn.transaction()?;
    for id in ids { repository::delete(&tx, id)?; }
    tx.commit()?;
    repository::list(conn)
}
