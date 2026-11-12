export type EntityKey = "students" | "teachers" | "vehicles" | "courses";

export type CatalogItem = {
  id: string;
  updatedAt: string;
  status: string;
};

export type FormValues = { [key: string]: string };

export type FieldConfig = {
  key: string;
  label: string;
  type?: "text" | "date" | "time" | "number" | "select";
  options?: string[];
  required?: boolean;
};

export type EntityConfig = {
  key: EntityKey;
  title: string;
  singular: string;
  description: string;
  searchField: string;
  fields: FieldConfig[];
};
