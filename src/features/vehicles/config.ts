import type { EntityConfig } from "@/types/catalog";

export const vehicleConfig: EntityConfig = {
  key: "vehicles",
  title: "Xe đào tạo",
  singular: "xe",
  description: "Danh sách xe, trạng thái và các mốc hết hạn.",
  searchField: "plate",
  fields: [
    { key: "plate", label: "Biển số", required: true },
    { key: "model", label: "Dòng xe", required: true },
    { key: "type", label: "Loại xe", type: "select", options: ["Số sàn", "Số tự động", "Cabin"] },
    { key: "inspectionExpiry", label: "Hạn đăng kiểm", type: "date" },
    { key: "status", label: "Trạng thái", type: "select", options: ["Đang dạy", "Chưa xếp lớp", "Bảo dưỡng"] },
  ],
};
