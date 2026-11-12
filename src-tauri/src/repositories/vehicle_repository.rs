use rusqlite::{Connection, Transaction, params};

use crate::{error::AppResult, models::vehicle::Vehicle};

pub fn list(conn: &Connection) -> AppResult<Vec<Vehicle>> {
    let mut statement = conn.prepare("SELECT id, plate, model, type, inspection_expiry, status, updated_at FROM vehicles ORDER BY position DESC")?;
    let rows = statement.query_map([], |row| {
        Ok(Vehicle {
            id: row.get(0)?,
            plate: row.get(1)?,
            model: row.get(2)?,
            vehicle_type: row.get(3)?,
            inspection_expiry: row.get(4)?,
            status: row.get(5)?,
            updated_at: row.get(6)?,
        })
    })?;
    Ok(rows.collect::<Result<Vec<_>, _>>()?)
}

pub fn insert(tx: &Transaction<'_>, item: &Vehicle) -> AppResult<()> {
    tx.execute(
        "INSERT INTO vehicles (id, plate, model, type, inspection_expiry, status, updated_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
        params![item.id, item.plate, item.model, item.vehicle_type, item.inspection_expiry, item.status, item.updated_at],
    )?;
    Ok(())
}

pub fn insert_missing(tx: &Transaction<'_>, item: &Vehicle) -> AppResult<usize> {
    let inserted = tx.execute(
        "INSERT OR IGNORE INTO vehicles (id, plate, model, type, inspection_expiry, status, updated_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
        params![item.id, item.plate, item.model, item.vehicle_type, item.inspection_expiry, item.status, item.updated_at],
    )?;
    Ok(inserted)
}

pub fn update(tx: &Transaction<'_>, item: &Vehicle) -> AppResult<()> {
    tx.execute(
        "UPDATE vehicles SET plate = ?2, model = ?3, type = ?4, inspection_expiry = ?5, status = ?6, updated_at = ?7 WHERE id = ?1",
        params![item.id, item.plate, item.model, item.vehicle_type, item.inspection_expiry, item.status, item.updated_at],
    )?;
    Ok(())
}

pub fn exists(conn: &Connection, id: &str) -> AppResult<bool> {
    Ok(conn.query_row(
        "SELECT EXISTS(SELECT 1 FROM vehicles WHERE id = ?1)",
        params![id],
        |row| row.get(0),
    )?)
}

pub fn delete(tx: &Transaction<'_>, id: &str) -> AppResult<()> {
    tx.execute("DELETE FROM vehicles WHERE id = ?1", params![id])?;
    Ok(())
}
