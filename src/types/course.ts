import type { CatalogItem } from "./catalog";

export type Course = CatalogItem & {
  code: string;
  name: string;
  startDate: string;
  endDate: string;
  capacity: string;
};
