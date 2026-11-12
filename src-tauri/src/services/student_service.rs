use rusqlite::Connection;

use crate::{
    database::sqlite,
    error::{AppError, AppResult},
    models::student::Student,
    repositories::student_repository as repository,
};

pub(crate) fn validate(item: &Student) -> AppResult<()> {
    if item.id.trim().is_empty() {
        return Err(AppError::MissingId);
    }
    if item.code.trim().is_empty() {
        return Err(AppError::MissingIdentifier);
    }
    if item.full_name.trim().is_empty() {
        return Err(AppError::MissingField("Họ và tên"));
    }
    if item.course.trim().is_empty() {
        return Err(AppError::MissingField("Khóa học"));
    }
    Ok(())
}

pub fn list(conn: &mut Connection) -> AppResult<Vec<Student>> {
    repository::list(conn)
}

pub fn save(conn: &mut Connection, mut item: Student) -> AppResult<Vec<Student>> {
    validate(&item)?;
    item.updated_at = sqlite::today(conn)?;
    let tx = conn.transaction()?;
    if repository::exists(&tx, &item.id)? {
        repository::update(&tx, &item)?;
    } else {
        repository::insert(&tx, &item)?;
    }
    tx.commit()?;
    repository::list(conn)
}

pub fn delete(conn: &mut Connection, ids: &[String]) -> AppResult<Vec<Student>> {
    let tx = conn.transaction()?;
    for id in ids {
        repository::delete(&tx, id)?;
    }
    tx.commit()?;
    repository::list(conn)
}
