import { invokeDatabase } from "@/services/database-invoke";
import type { EntityService } from "@/services/entity-service";
import type { Teacher } from "@/types/teacher";

export const teacherService: EntityService<Teacher> = {
  list: () => invokeDatabase<Teacher[]>("list_teachers"),
  save: (values, id) => {
    const teacher: Teacher = {
      id: id ?? crypto.randomUUID(),
      updatedAt: "",
      code: values.code ?? "",
      fullName: values.fullName ?? "",
      licenseClass: values.licenseClass ?? "",
      licenseExpiry: values.licenseExpiry ?? "",
      phone: values.phone ?? "",
      status: values.status ?? "",
    };
    return invokeDatabase<Teacher[]>("save_teacher", { teacher });
  },
  delete: (ids) => invokeDatabase<Teacher[]>("delete_teachers", { ids }),
};
