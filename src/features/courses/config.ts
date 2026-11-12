import type { EntityConfig } from "@/types/catalog";

export const courseConfig: EntityConfig = {
  key: "courses",
  title: "Khóa học",
  singular: "khóa học",
  description: "Các khóa đang đào tạo và kế hoạch khai giảng.",
  searchField: "name",
  fields: [
    { key: "code", label: "Mã khóa", required: true },
    { key: "name", label: "Tên khóa", required: true },
    { key: "startDate", label: "Ngày bắt đầu", type: "date" },
    { key: "endDate", label: "Ngày kết thúc", type: "date" },
    { key: "capacity", label: "Lưu lượng tối đa", type: "number" },
    { key: "status", label: "Trạng thái", type: "select", options: ["Sắp khai giảng", "Đang đào tạo", "Đã kết thúc"] },
  ],
};
