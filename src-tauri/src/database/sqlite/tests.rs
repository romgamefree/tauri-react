use super::migrations::migrate;
use super::*;
use crate::models::{student::Student, teacher::Teacher};
use crate::repositories::{
    course_repository, student_repository, teacher_repository, vehicle_repository,
};
use crate::services::{
    seed_service::{self, SeedData},
    student_service,
};
use rusqlite::params;

#[test]
fn migrates_every_domain_and_keeps_legacy_payloads() {
    let mut conn = Connection::open_in_memory().unwrap();
    conn.execute_batch(
        "CREATE TABLE records (
                position INTEGER PRIMARY KEY AUTOINCREMENT,
                entity TEXT NOT NULL,
                id TEXT NOT NULL,
                identifier TEXT NOT NULL,
                payload TEXT NOT NULL
            );
            CREATE TABLE initialized_entities (entity TEXT PRIMARY KEY);",
    )
    .unwrap();
    conn.pragma_update(None, "user_version", 1).unwrap();
    let samples = [
        (
            "students",
            "student-1",
            "HV001",
            serde_json::json!({"id":"student-1","code":"HV001","fullName":"An","course":"B2","phone":"090","status":"Đang học","updatedAt":"2026-01-01","customField":"preserved"}),
        ),
        (
            "teachers",
            "teacher-1",
            "GV001",
            serde_json::json!({"id":"teacher-1","code":"GV001","fullName":"Bình","licenseClass":"C","licenseExpiry":"2027-01-01","phone":"091","status":"Đang dạy","updatedAt":"2026-01-01"}),
        ),
        (
            "vehicles",
            "vehicle-1",
            "51A-123",
            serde_json::json!({"id":"vehicle-1","plate":"51A-123","model":"Vios","type":"Số sàn","inspectionExpiry":"2027-01-01","status":"Đang dạy","updatedAt":"2026-01-01"}),
        ),
        (
            "courses",
            "course-1",
            "B2-01",
            serde_json::json!({"id":"course-1","code":"B2-01","name":"Khóa B2","startDate":"2026-01-01","endDate":"2026-06-01","capacity":"30","status":"Đang đào tạo","updatedAt":"2026-01-01"}),
        ),
    ];
    for (entity, id, identifier, payload) in samples {
        conn.execute(
            "INSERT INTO records(entity,id,identifier,payload) VALUES (?1,?2,?3,?4)",
            params![entity, id, identifier, payload.to_string()],
        )
        .unwrap();
        conn.execute(
            "INSERT INTO initialized_entities(entity) VALUES (?1)",
            [entity],
        )
        .unwrap();
    }
    migrate(&mut conn).unwrap();
    migrate(&mut conn).unwrap();
    assert_eq!(
        conn.pragma_query_value(None, "user_version", |row| row.get::<_, i64>(0))
            .unwrap(),
        2
    );
    assert_eq!(student_repository::list(&conn).unwrap()[0].full_name, "An");
    assert_eq!(
        teacher_repository::list(&conn).unwrap()[0].license_class,
        "C"
    );
    assert_eq!(
        vehicle_repository::list(&conn).unwrap()[0].vehicle_type,
        "Số sàn"
    );
    assert_eq!(course_repository::list(&conn).unwrap()[0].capacity, "30");
    let payload: String = conn
        .query_row(
            "SELECT payload FROM legacy_records_backup WHERE entity = 'students'",
            [],
            |row| row.get(0),
        )
        .unwrap();
    assert!(payload.contains("customField"));
}

#[test]
fn new_database_has_domain_tables_without_a_shared_records_table() {
    let mut conn = Connection::open_in_memory().unwrap();
    migrate(&mut conn).unwrap();
    for table in ["students", "teachers", "vehicles", "courses"] {
        let exists: bool = conn
            .query_row(
                "SELECT EXISTS(SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = ?1)",
                [table],
                |row| row.get(0),
            )
            .unwrap();
        assert!(exists, "{table} is missing");
    }
    let records_exists: bool = conn
        .query_row(
            "SELECT EXISTS(SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = 'records')",
            [],
            |row| row.get(0),
        )
        .unwrap();
    assert!(!records_exists);
}

#[test]
fn student_crud_stays_in_its_own_table() {
    let mut conn = Connection::open_in_memory().unwrap();
    migrate(&mut conn).unwrap();
    let item = Student {
        id: "student-1".into(),
        code: "HV001".into(),
        full_name: "An".into(),
        course: "B2".into(),
        phone: String::new(),
        status: String::new(),
        updated_at: String::new(),
    };
    assert_eq!(
        student_service::save(&mut conn, item.clone())
            .unwrap()
            .len(),
        1
    );
    assert_eq!(teacher_repository::list(&conn).unwrap().len(), 0);
    let mut duplicate = item.clone();
    duplicate.id = "student-2".into();
    duplicate.code = "hv001".into();
    assert!(matches!(
        student_service::save(&mut conn, duplicate),
        Err(AppError::DuplicateIdentifier)
    ));
    let mut changed = item.clone();
    changed.full_name = "Bình".into();
    assert_eq!(
        student_service::save(&mut conn, changed).unwrap()[0].full_name,
        "Bình"
    );
    assert!(
        student_service::delete(&mut conn, &[item.id])
            .unwrap()
            .is_empty()
    );
}

#[test]
fn seeding_is_explicit_idempotent_and_preserves_existing_edits() {
    let mut conn = Connection::open_in_memory().unwrap();
    migrate(&mut conn).unwrap();
    let student = Student {
        id: "student-1".into(),
        code: "HV001".into(),
        full_name: "An".into(),
        course: "B2".into(),
        phone: String::new(),
        status: String::new(),
        updated_at: String::new(),
    };
    assert!(student_repository::list(&conn).unwrap().is_empty());
    let seed = || SeedData {
        students: vec![student.clone()],
        teachers: vec![],
        vehicles: vec![],
        courses: vec![],
    };
    assert_eq!(seed_service::seed(&mut conn, seed()).unwrap().students, 1);
    let mut edited = student.clone();
    edited.full_name = "Bình".into();
    student_service::save(&mut conn, edited).unwrap();
    assert_eq!(seed_service::seed(&mut conn, seed()).unwrap().students, 0);
    assert_eq!(
        student_repository::list(&conn).unwrap()[0].full_name,
        "Bình"
    );
}

#[test]
fn failed_seed_rolls_back_other_categories() {
    let mut conn = Connection::open_in_memory().unwrap();
    migrate(&mut conn).unwrap();
    let data = SeedData {
        students: vec![Student {
            id: "student-1".into(),
            code: "HV001".into(),
            full_name: "An".into(),
            course: "B2".into(),
            phone: String::new(),
            status: String::new(),
            updated_at: String::new(),
        }],
        teachers: vec![Teacher {
            id: "teacher-1".into(),
            code: "GV001".into(),
            full_name: String::new(),
            license_class: String::new(),
            license_expiry: String::new(),
            phone: String::new(),
            status: String::new(),
            updated_at: String::new(),
        }],
        vehicles: vec![],
        courses: vec![],
    };
    assert!(seed_service::seed(&mut conn, data).is_err());
    assert!(student_repository::list(&conn).unwrap().is_empty());
    assert!(teacher_repository::list(&conn).unwrap().is_empty());
}
