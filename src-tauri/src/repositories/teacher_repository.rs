use rusqlite::{params, Connection, Transaction};

use crate::{error::AppResult, models::teacher::Teacher};

pub fn list(conn: &Connection) -> AppResult<Vec<Teacher>> {
    let mut statement = conn.prepare("SELECT id, code, full_name, license_class, license_expiry, phone, status, updated_at FROM teachers ORDER BY position DESC")?;
    let rows = statement.query_map([], |row| Ok(Teacher {
        id: row.get(0)?,
        code: row.get(1)?,
        full_name: row.get(2)?,
        license_class: row.get(3)?,
        license_expiry: row.get(4)?,
        phone: row.get(5)?,
        status: row.get(6)?,
        updated_at: row.get(7)?,
    }))?;
    Ok(rows.collect::<Result<Vec<_>, _>>()?)
}

pub fn insert(tx: &Transaction<'_>, item: &Teacher) -> AppResult<()> {
    tx.execute(
        "INSERT INTO teachers (id, code, full_name, license_class, license_expiry, phone, status, updated_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
        params![item.id, item.code, item.full_name, item.license_class, item.license_expiry, item.phone, item.status, item.updated_at],
    )?;
    Ok(())
}

pub fn insert_missing(tx: &Transaction<'_>, item: &Teacher) -> AppResult<usize> {
    let inserted = tx.execute(
        "INSERT OR IGNORE INTO teachers (id, code, full_name, license_class, license_expiry, phone, status, updated_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
        params![item.id, item.code, item.full_name, item.license_class, item.license_expiry, item.phone, item.status, item.updated_at],
    )?;
    Ok(inserted)
}

pub fn update(tx: &Transaction<'_>, item: &Teacher) -> AppResult<()> {
    tx.execute(
        "UPDATE teachers SET code = ?2, full_name = ?3, license_class = ?4, license_expiry = ?5, phone = ?6, status = ?7, updated_at = ?8 WHERE id = ?1",
        params![item.id, item.code, item.full_name, item.license_class, item.license_expiry, item.phone, item.status, item.updated_at],
    )?;
    Ok(())
}

pub fn exists(conn: &Connection, id: &str) -> AppResult<bool> {
    Ok(conn.query_row(
        "SELECT EXISTS(SELECT 1 FROM teachers WHERE id = ?1)",
        params![id],
        |row| row.get(0),
    )?)
}

pub fn delete(tx: &Transaction<'_>, id: &str) -> AppResult<()> {
    tx.execute("DELETE FROM teachers WHERE id = ?1", params![id])?;
    Ok(())
}
