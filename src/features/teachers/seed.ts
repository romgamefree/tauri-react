import type { Teacher } from "@/types/teacher";

export const teacherSeed: Teacher[] = [
  ["GV001", "Nguyễn Văn Hùng", "B2", "2027-08-30", "0912345678", "Đang dạy"],
  ["GV002", "Trần Thu Hà", "C", "2026-12-15", "0912345679", "Đang dạy"],
  ["GV003", "Lê Quốc Khánh", "B2", "2027-04-10", "0912345680", "Chưa xếp lớp"],
  ["GV004", "Phạm Minh Tuấn", "C", "2026-11-30", "0912345681", "Tạm nghỉ"],
].map(([code, fullName, licenseClass, licenseExpiry, phone, status]) => ({
  id: code, code, fullName, licenseClass, licenseExpiry, phone, status, updatedAt: "2026-11-11",
}));
