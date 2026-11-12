import type { CatalogItem } from "./catalog";

export type Teacher = CatalogItem & {
  code: string;
  fullName: string;
  licenseClass: string;
  licenseExpiry: string;
  phone: string;
};
