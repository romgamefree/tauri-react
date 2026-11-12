use rusqlite::{Connection, Transaction, params};

use crate::{error::AppResult, models::course::Course};

pub fn list(conn: &Connection) -> AppResult<Vec<Course>> {
    let mut statement = conn.prepare("SELECT id, code, name, start_date, end_date, capacity, status, updated_at FROM courses ORDER BY position DESC")?;
    let rows = statement.query_map([], |row| {
        Ok(Course {
            id: row.get(0)?,
            code: row.get(1)?,
            name: row.get(2)?,
            start_date: row.get(3)?,
            end_date: row.get(4)?,
            capacity: row.get(5)?,
            status: row.get(6)?,
            updated_at: row.get(7)?,
        })
    })?;
    Ok(rows.collect::<Result<Vec<_>, _>>()?)
}

pub fn insert(tx: &Transaction<'_>, item: &Course) -> AppResult<()> {
    tx.execute(
        "INSERT INTO courses (id, code, name, start_date, end_date, capacity, status, updated_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
        params![item.id, item.code, item.name, item.start_date, item.end_date, item.capacity, item.status, item.updated_at],
    )?;
    Ok(())
}

pub fn insert_missing(tx: &Transaction<'_>, item: &Course) -> AppResult<usize> {
    let inserted = tx.execute(
        "INSERT OR IGNORE INTO courses (id, code, name, start_date, end_date, capacity, status, updated_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
        params![item.id, item.code, item.name, item.start_date, item.end_date, item.capacity, item.status, item.updated_at],
    )?;
    Ok(inserted)
}

pub fn update(tx: &Transaction<'_>, item: &Course) -> AppResult<()> {
    tx.execute(
        "UPDATE courses SET code = ?2, name = ?3, start_date = ?4, end_date = ?5, capacity = ?6, status = ?7, updated_at = ?8 WHERE id = ?1",
        params![item.id, item.code, item.name, item.start_date, item.end_date, item.capacity, item.status, item.updated_at],
    )?;
    Ok(())
}

pub fn exists(conn: &Connection, id: &str) -> AppResult<bool> {
    Ok(conn.query_row(
        "SELECT EXISTS(SELECT 1 FROM courses WHERE id = ?1)",
        params![id],
        |row| row.get(0),
    )?)
}

pub fn delete(tx: &Transaction<'_>, id: &str) -> AppResult<()> {
    tx.execute("DELETE FROM courses WHERE id = ?1", params![id])?;
    Ok(())
}
