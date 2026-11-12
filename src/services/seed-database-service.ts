import { courseSeed } from "@/features/courses/seed";
import { studentSeed } from "@/features/students/seed";
import { teacherSeed } from "@/features/teachers/seed";
import { vehicleSeed } from "@/features/vehicles/seed";
import { invokeDatabase } from "@/services/database-invoke";

export type SeedResult = {
  students: number;
  teachers: number;
  vehicles: number;
  courses: number;
};

export function seedDatabase() {
  return invokeDatabase<SeedResult>("seed_database", {
    data: { students: studentSeed, teachers: teacherSeed, vehicles: vehicleSeed, courses: courseSeed },
  });
}
