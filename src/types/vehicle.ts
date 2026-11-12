import type { CatalogItem } from "./catalog";

export type Vehicle = CatalogItem & {
  plate: string;
  model: string;
  type: string;
  inspectionExpiry: string;
};
