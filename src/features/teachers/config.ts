import type { EntityConfig } from "@/types/catalog";

export const teacherConfig: EntityConfig = {
  key: "teachers",
  title: "Giáo viên",
  singular: "giáo viên",
  description: "Thông tin giáo viên và thời hạn giấy phép lái xe.",
  searchField: "fullName",
  fields: [
    { key: "code", label: "Mã giáo viên", required: true },
    { key: "fullName", label: "Họ và tên", required: true },
    { key: "licenseClass", label: "Hạng GPLX" },
    { key: "licenseExpiry", label: "Hạn GPLX", type: "date" },
    { key: "phone", label: "Số điện thoại" },
    { key: "status", label: "Trạng thái", type: "select", options: ["Đang dạy", "Chưa xếp lớp", "Tạm nghỉ"] },
  ],
};
