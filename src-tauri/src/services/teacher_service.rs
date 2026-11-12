use rusqlite::Connection;

use crate::{
    database,
    error::{AppError, AppResult},
    models::teacher::Teacher,
    repositories::teacher_repository as repository,
};

pub(crate) fn validate(item: &Teacher) -> AppResult<()> {
    if item.id.trim().is_empty() { return Err(AppError::MissingId); }
    if item.code.trim().is_empty() { return Err(AppError::MissingIdentifier); }
    if item.full_name.trim().is_empty() { return Err(AppError::MissingField("Họ và tên")); }
    Ok(())
}

pub fn list(conn: &mut Connection) -> AppResult<Vec<Teacher>> {
    repository::list(conn)
}

pub fn save(conn: &mut Connection, mut item: Teacher) -> AppResult<Vec<Teacher>> {
    validate(&item)?;
    item.updated_at = database::today(conn)?;
    let tx = conn.transaction()?;
    if repository::exists(&tx, &item.id)? { repository::update(&tx, &item)?; }
    else { repository::insert(&tx, &item)?; }
    tx.commit()?;
    repository::list(conn)
}

pub fn delete(conn: &mut Connection, ids: &[String]) -> AppResult<Vec<Teacher>> {
    let tx = conn.transaction()?;
    for id in ids { repository::delete(&tx, id)?; }
    tx.commit()?;
    repository::list(conn)
}
