import type { CatalogItem } from "./catalog";

export type Student = CatalogItem & {
  code: string;
  fullName: string;
  course: string;
  phone: string;
};
