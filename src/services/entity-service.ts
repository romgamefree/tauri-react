import type { CatalogItem, FormValues } from "@/types/catalog";

export type EntityService<T extends CatalogItem> = {
  list(): Promise<T[]>;
  save(values: FormValues, id?: string): Promise<T[]>;
  delete(ids: string[]): Promise<T[]>;
};
