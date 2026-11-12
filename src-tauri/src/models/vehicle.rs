use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Vehicle {
    #[serde(default)]
    pub id: String,
    #[serde(default)]
    pub plate: String,
    #[serde(default)]
    pub model: String,
    #[serde(default)]
    #[serde(rename = "type")]
    pub vehicle_type: String,
    #[serde(default)]
    pub inspection_expiry: String,
    #[serde(default)]
    pub status: String,
    #[serde(default)]
    pub updated_at: String,
}
