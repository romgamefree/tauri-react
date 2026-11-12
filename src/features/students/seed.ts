import type { Student } from "@/types/student";

const studentNames = [
  "Nguyễn Văn An", "Trần Thị Bình", "Lê Minh Châu", "Phạm Quốc Dũng",
  "Hoàng Thị Giang", "Võ Thanh Hải", "Đặng Mỹ Linh", "Bùi Đức Long",
  "Ngô Thu Mai", "Đỗ Quang Nam", "Phan Ngọc Phương", "Vũ Thành Sơn",
];

export const studentSeed: Student[] = studentNames.map((fullName, index) => ({
  id: `student-${index + 1}`,
  code: `HV${String(index + 1).padStart(3, "0")}`,
  fullName,
  course: index < 6 ? "B2-2026-01" : "C-2026-02",
  phone: `090${String(1000000 + index * 27381).slice(-7)}`,
  status: index === 3 || index === 8 ? "Bảo lưu" : index === 11 ? "Tốt nghiệp" : "Đang học",
  updatedAt: "2026-11-11",
}));
