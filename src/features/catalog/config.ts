import { courseConfig } from "@/features/courses/config";
import { studentConfig } from "@/features/students/config";
import { teacherConfig } from "@/features/teachers/config";
import { vehicleConfig } from "@/features/vehicles/config";
import type { EntityConfig, EntityKey } from "@/types/catalog";

export const entities: { [key in EntityKey]: EntityConfig } = {
  students: studentConfig,
  teachers: teacherConfig,
  vehicles: vehicleConfig,
  courses: courseConfig,
};

