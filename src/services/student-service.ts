import { invokeDatabase } from "@/services/database-invoke";
import type { EntityService } from "@/services/entity-service";
import type { Student } from "@/types/student";

export const studentService: EntityService<Student> = {
  list: () => invokeDatabase<Student[]>("list_students"),
  save: (values, id) => {
    const student: Student = {
      id: id ?? crypto.randomUUID(),
      updatedAt: "",
      code: values.code ?? "",
      fullName: values.fullName ?? "",
      course: values.course ?? "",
      phone: values.phone ?? "",
      status: values.status ?? "",
    };
    return invokeDatabase<Student[]>("save_student", { student });
  },
  delete: (ids) => invokeDatabase<Student[]>("delete_students", { ids }),
};
