import { invoke } from "@tauri-apps/api/core";
import type { SavedSqlServerConnection, SqlServerInput } from "@/types/sql-server";

export function loadSqlServerConnection() {
  return invoke<SavedSqlServerConnection>("load_sql_server_connection");
}

export function saveSqlServerConnection(settings: SqlServerInput) {
  return invoke<void>("save_sql_server_connection", { settings });
}

export function testSqlServerConnection(settings: SqlServerInput) {
  return invoke<void>("test_sql_server_connection", { settings });
}
