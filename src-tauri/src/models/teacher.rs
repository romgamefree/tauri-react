use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Teacher {
    #[serde(default)]
    pub id: String,
    #[serde(default)]
    pub code: String,
    #[serde(default)]
    pub full_name: String,
    #[serde(default)]
    pub license_class: String,
    #[serde(default)]
    pub license_expiry: String,
    #[serde(default)]
    pub phone: String,
    #[serde(default)]
    pub status: String,
    #[serde(default)]
    pub updated_at: String,
}
