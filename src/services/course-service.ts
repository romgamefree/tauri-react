import { invokeDatabase } from "@/services/database-invoke";
import type { EntityService } from "@/services/entity-service";
import type { Course } from "@/types/course";

export const courseService: EntityService<Course> = {
  list: () => invokeDatabase<Course[]>("list_courses"),
  save: (values, id) => {
    const course: Course = {
      id: id ?? crypto.randomUUID(),
      updatedAt: "",
      code: values.code ?? "",
      name: values.name ?? "",
      startDate: values.startDate ?? "",
      endDate: values.endDate ?? "",
      capacity: values.capacity ?? "",
      status: values.status ?? "",
    };
    return invokeDatabase<Course[]>("save_course", { course });
  },
  delete: (ids) => invokeDatabase<Course[]>("delete_courses", { ids }),
};
