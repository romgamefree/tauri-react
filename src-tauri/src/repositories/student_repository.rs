use rusqlite::{params, Connection, Transaction};

use crate::{error::AppResult, models::student::Student};

pub fn list(conn: &Connection) -> AppResult<Vec<Student>> {
    let mut statement = conn.prepare("SELECT id, code, full_name, course, phone, status, updated_at FROM students ORDER BY position DESC")?;
    let rows = statement.query_map([], |row| Ok(Student {
        id: row.get(0)?,
        code: row.get(1)?,
        full_name: row.get(2)?,
        course: row.get(3)?,
        phone: row.get(4)?,
        status: row.get(5)?,
        updated_at: row.get(6)?,
    }))?;
    Ok(rows.collect::<Result<Vec<_>, _>>()?)
}

pub fn insert(tx: &Transaction<'_>, item: &Student) -> AppResult<()> {
    tx.execute(
        "INSERT INTO students (id, code, full_name, course, phone, status, updated_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
        params![item.id, item.code, item.full_name, item.course, item.phone, item.status, item.updated_at],
    )?;
    Ok(())
}

pub fn insert_missing(tx: &Transaction<'_>, item: &Student) -> AppResult<usize> {
    let inserted = tx.execute(
        "INSERT OR IGNORE INTO students (id, code, full_name, course, phone, status, updated_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
        params![item.id, item.code, item.full_name, item.course, item.phone, item.status, item.updated_at],
    )?;
    Ok(inserted)
}

pub fn update(tx: &Transaction<'_>, item: &Student) -> AppResult<()> {
    tx.execute(
        "UPDATE students SET code = ?2, full_name = ?3, course = ?4, phone = ?5, status = ?6, updated_at = ?7 WHERE id = ?1",
        params![item.id, item.code, item.full_name, item.course, item.phone, item.status, item.updated_at],
    )?;
    Ok(())
}

pub fn exists(conn: &Connection, id: &str) -> AppResult<bool> {
    Ok(conn.query_row(
        "SELECT EXISTS(SELECT 1 FROM students WHERE id = ?1)",
        params![id],
        |row| row.get(0),
    )?)
}

pub fn delete(tx: &Transaction<'_>, id: &str) -> AppResult<()> {
    tx.execute("DELETE FROM students WHERE id = ?1", params![id])?;
    Ok(())
}
