import { invokeDatabase } from "@/services/database-invoke";
import type { EntityService } from "@/services/entity-service";
import type { Vehicle } from "@/types/vehicle";

export const vehicleService: EntityService<Vehicle> = {
  list: () => invokeDatabase<Vehicle[]>("list_vehicles"),
  save: (values, id) => {
    const vehicle: Vehicle = {
      id: id ?? crypto.randomUUID(),
      updatedAt: "",
      plate: values.plate ?? "",
      model: values.model ?? "",
      type: values.type ?? "",
      inspectionExpiry: values.inspectionExpiry ?? "",
      status: values.status ?? "",
    };
    return invokeDatabase<Vehicle[]>("save_vehicle", { vehicle });
  },
  delete: (ids) => invokeDatabase<Vehicle[]>("delete_vehicles", { ids }),
};
