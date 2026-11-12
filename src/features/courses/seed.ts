import type { Course } from "@/types/course";

export const courseSeed: Course[] = [
  ["B2-2026-01", "Đào tạo lái xe B2 khóa 01", "2026-09-01", "2027-02-28", "120", "Đang đào tạo"],
  ["C-2026-02", "Đào tạo lái xe C khóa 02", "2026-10-15", "2027-04-15", "80", "Đang đào tạo"],
  ["B2-2027-01", "Đào tạo lái xe B2 khóa 2027", "2027-01-10", "2027-06-30", "120", "Sắp khai giảng"],
].map(([code, name, startDate, endDate, capacity, status]) => ({
  id: code, code, name, startDate, endDate, capacity, status, updatedAt: "2026-11-11",
}));
