import type { EntityConfig } from "@/types/catalog";

export const studentConfig: EntityConfig = {
  key: "students",
  title: "Học viên",
  singular: "học viên",
  description: "Hồ sơ, khóa học và tình trạng đào tạo của học viên.",
  searchField: "fullName",
  fields: [
    { key: "code", label: "Mã học viên", required: true },
    { key: "fullName", label: "Họ và tên", required: true },
    { key: "course", label: "Khóa học", required: true },
    { key: "phone", label: "Số điện thoại" },
    { key: "status", label: "Trạng thái", type: "select", options: ["Đang học", "Bảo lưu", "Tốt nghiệp"] },
  ],
};
