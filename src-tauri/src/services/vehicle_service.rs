use rusqlite::Connection;

use crate::{
    database,
    error::{AppError, AppResult},
    models::vehicle::Vehicle,
    repositories::vehicle_repository as repository,
};

pub(crate) fn validate(item: &Vehicle) -> AppResult<()> {
    if item.id.trim().is_empty() { return Err(AppError::MissingId); }
    if item.plate.trim().is_empty() { return Err(AppError::MissingIdentifier); }
    if item.model.trim().is_empty() { return Err(AppError::MissingField("Dòng xe")); }
    Ok(())
}

pub fn list(conn: &mut Connection) -> AppResult<Vec<Vehicle>> {
    repository::list(conn)
}

pub fn save(conn: &mut Connection, mut item: Vehicle) -> AppResult<Vec<Vehicle>> {
    validate(&item)?;
    item.updated_at = database::today(conn)?;
    let tx = conn.transaction()?;
    if repository::exists(&tx, &item.id)? { repository::update(&tx, &item)?; }
    else { repository::insert(&tx, &item)?; }
    tx.commit()?;
    repository::list(conn)
}

pub fn delete(conn: &mut Connection, ids: &[String]) -> AppResult<Vec<Vehicle>> {
    let tx = conn.transaction()?;
    for id in ids { repository::delete(&tx, id)?; }
    tx.commit()?;
    repository::list(conn)
}
