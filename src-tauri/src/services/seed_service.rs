use rusqlite::Connection;
use serde::{Deserialize, Serialize};

use crate::{
    error::AppResult,
    models::{course::Course, student::Student, teacher::Teacher, vehicle::Vehicle},
    repositories::{course_repository, student_repository, teacher_repository, vehicle_repository},
    services::{course_service, student_service, teacher_service, vehicle_service},
};

#[derive(Deserialize)]
pub struct SeedData {
    pub students: Vec<Student>,
    pub teachers: Vec<Teacher>,
    pub vehicles: Vec<Vehicle>,
    pub courses: Vec<Course>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SeedResult {
    pub students: usize,
    pub teachers: usize,
    pub vehicles: usize,
    pub courses: usize,
}

pub fn seed(conn: &mut Connection, data: SeedData) -> AppResult<SeedResult> {
    let tx = conn.transaction()?;
    let mut result = SeedResult { students: 0, teachers: 0, vehicles: 0, courses: 0 };
    for item in data.students.iter().rev() {
        student_service::validate(item)?;
        result.students += student_repository::insert_missing(&tx, item)?;
    }
    for item in data.teachers.iter().rev() {
        teacher_service::validate(item)?;
        result.teachers += teacher_repository::insert_missing(&tx, item)?;
    }
    for item in data.vehicles.iter().rev() {
        vehicle_service::validate(item)?;
        result.vehicles += vehicle_repository::insert_missing(&tx, item)?;
    }
    for item in data.courses.iter().rev() {
        course_service::validate(item)?;
        result.courses += course_repository::insert_missing(&tx, item)?;
    }
    tx.commit()?;
    Ok(result)
}
