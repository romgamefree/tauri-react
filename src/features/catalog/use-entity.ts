import { useEffect, useState } from "react";

import { useToast } from "@/hooks/use-toast";
import type { EntityService } from "@/services/entity-service";
import type { CatalogItem, EntityConfig, FormValues } from "@/types/catalog";

export function useEntity<T extends CatalogItem>(config: EntityConfig, service: EntityService<T>) {
  const { toast, notify, dismissToast } = useToast();
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [editing, setEditing] = useState<T | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<string[]>([]);

  useEffect(() => {
    let active = true;
    service.list()
      .then((data) => { if (active) setItems(data); })
      .catch((cause) => { if (active) setPageError(String(cause)); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [service]);

  async function retryLoad() {
    setPageError("");
    setLoading(true);
    try {
      setItems(await service.list());
    } catch (cause) {
      setPageError(String(cause));
    } finally {
      setLoading(false);
    }
  }

  async function saveItem(values: FormValues, id?: string) {
    setItems(await service.save(values, id));
    setPageError("");
    setFormOpen(false);
    setEditing(null);
    notify(id ? `Đã cập nhật ${config.singular}.` : `Đã thêm ${config.singular}.`);
  }

  async function copyId(id: string) {
    try {
      await navigator.clipboard.writeText(id);
      notify("Đã sao chép ID vào bộ nhớ tạm.");
    } catch {
      notify("Không thể sao chép ID. Hãy kiểm tra quyền truy cập bộ nhớ tạm.", "error");
    }
  }

  function startEdit(item: T) {
    setEditing(item);
    setFormOpen(true);
  }

  function startCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  async function deleteItems() {
    try {
      const count = pendingDelete.length;
      setItems(await service.delete(pendingDelete));
      setPageError("");
      setPendingDelete([]);
      notify(`Đã xóa ${count} ${config.singular}.`);
    } catch (cause) {
      setPageError(String(cause));
      notify(`Không thể xóa ${config.singular}: ${String(cause)}`, "error");
    }
  }

  return {
    config, items, loading, pageError, retryLoad,
    editing, formOpen, setFormOpen, startEdit, startCreate, saveItem,
    pendingDelete, setPendingDelete, deleteItems,
    copyId, toast, dismissToast, notify,
  };
}

export type EntityController<T extends CatalogItem> = ReturnType<typeof useEntity<T>>;
