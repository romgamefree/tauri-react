import { invoke, isTauri } from "@tauri-apps/api/core";

export function invokeDatabase<T>(command: string, args?: { [key: string]: unknown }): Promise<T> {
  if (!isTauri()) {
    return Promise.reject(new Error("Cơ sở dữ liệu chỉ khả dụng trong ứng dụng desktop Tauri."));
  }
  return invoke<T>(command, args);
}
