import type { Vehicle } from "@/types/vehicle";

export const vehicleSeed: Vehicle[] = [
  ["51A-123.45", "Toyota Vios", "Số tự động", "2027-06-30", "Đang dạy"],
  ["51A-456.78", "Hyundai Accent", "Số sàn", "2026-12-20", "Đang dạy"],
  ["51A-789.01", "Kia Soluto", "Số sàn", "2027-03-14", "Chưa xếp lớp"],
  ["51B-234.56", "Cabin mô phỏng", "Cabin", "", "Bảo dưỡng"],
].map(([plate, model, type, inspectionExpiry, status]) => ({
  id: plate, plate, model, type, inspectionExpiry, status, updatedAt: "2026-11-11",
}));
