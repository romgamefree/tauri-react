import { useState, type FormEvent } from "react";

import { DateTimeField } from "@/components/date-time-field";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { CatalogItem, EntityConfig, FormValues } from "@/types/catalog";

export function EntityForm<T extends CatalogItem>({
  config,
  item,
  items,
  onSave,
  onError,
  onCancel,
}: {
  config: EntityConfig;
  item: T | null;
  items: T[];
  onSave: (values: FormValues, id?: string) => Promise<void>;
  onError: (message: string) => void;
  onCancel: () => void;
}) {
  const [values, setValues] = useState<FormValues>(() =>
    Object.fromEntries(config.fields.map((field) => [
      field.key,
      String(item?.[field.key as keyof T] ?? field.options?.[0] ?? ""),
    ])),
  );
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const missing = config.fields.find((field) => field.required && !values[field.key]?.trim());
    if (missing) {
      const message = `${missing.label} không được để trống.`;
      setError(message);
      onError(message);
      return;
    }
    const identifier = config.fields[0].key;
    const normalized = values[identifier]?.trim().toLocaleLowerCase("vi-VN");
    if (items.some((candidate) => candidate.id !== item?.id && String(candidate[identifier as keyof T] ?? "").trim().toLocaleLowerCase("vi-VN") === normalized)) {
      const message = `${config.fields[0].label} đã tồn tại.`;
      setError(message);
      onError(message);
      return;
    }
    setError("");
    setSaving(true);
    try {
      await onSave(Object.fromEntries(Object.entries(values).map(([key, value]) => [key, value.trim()])), item?.id);
    } catch (cause) {
      const message = String(cause);
      setError(message);
      onError(message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid max-h-[60vh] gap-4 overflow-y-auto pr-1 sm:grid-cols-2">
        {config.fields.map((field) => field.type === "date" || field.type === "time" ? (
          <DateTimeField
            key={field.key}
            id={field.key}
            label={field.label}
            mode={field.type}
            value={values[field.key] ?? ""}
            required={field.required}
            onChange={(value) => setValues((current) => ({ ...current, [field.key]: value }))}
          />
        ) : (
          <label key={field.key} className="grid gap-1.5 text-sm font-medium">
            {field.label}
            {field.type === "select" ? (
              <select
                className="h-8 rounded-lg border border-input bg-background px-2 text-sm font-normal text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={values[field.key]}
                onChange={(event) => setValues({ ...values, [field.key]: event.target.value })}
              >
                {field.options?.map((option) => <option key={option}>{option}</option>)}
              </select>
            ) : (
              <Input
                type={field.type ?? "text"}
                required={field.required}
                min={field.type === "number" ? "0" : undefined}
                value={values[field.key]}
                onChange={(event) => setValues({ ...values, [field.key]: event.target.value })}
              />
            )}
          </label>
        ))}
      </div>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>Hủy</Button>
        <Button type="submit" disabled={saving}>{saving ? "Đang lưu..." : item ? "Lưu thay đổi" : "Thêm mới"}</Button>
      </DialogFooter>
    </form>
  );
}
