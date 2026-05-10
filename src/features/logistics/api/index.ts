import api from "@/src/api/axios";
import { User } from "@/src/store/AuthStore";
import z from "zod";

import {
  AssignedVehicle,
  EventVehicle,
  SelectTransportation,
  VEHICLE_WITH_ASSIGNMENT
} from "../type";

export const dateSchema = z.union([
  z.date(),
  z.string().datetime(),
  z.string().date(),
]).transform((val) => val instanceof Date ? val : new Date(val))
  .nullable();

export const createVehicleSchema = z.object({
  vehicleName: z.string().nonempty(),
  driverName: z.string().optional(),
  driverNumber: z.string().optional(),
  capacity: z.number().nonnegative(),
  availablityStartTime: dateSchema,
  availablityEndTime: dateSchema,
});

export type CreateVehicle = z.infer<typeof createVehicleSchema>;

export type AssignVehiclePayload = Omit<AssignedVehicle, "createdAt" | "updatedAt">;

export type UpdateVehiclePayload = Partial<
  Pick<
    EventVehicle,
    | "vehicleName"
    | "driverName"
    | "driverNumber"
    | "capacity"
    | "availablityStartTime"
    | "availablityEndTime"
  >
>;



export const getGuestTransportation: (eventId: string) => Promise<SelectTransportation[]> = async (eventId: string) => {
  const response = await api.get(`/event/${eventId}/transportation`);
  return response.data.data ?? response.data
}

export const createVehicle = async (eventId: string, params: CreateVehicle) => {
  const response = await api.post(`/vehicle/${eventId}`, params);
  return response.data ?? response.data.data;
}

export const getEventVehicles: (eventId: string) => Promise<EventVehicle[]> = async (eventId: string) => {
  const response = await api.get(`vehicle/event/${eventId}`);

  return response.data.data ?? response.data;
}

export const update_vehicle = async (event_vehicle: string, params: UpdateVehiclePayload) => {
  const response = await api.patch(`vehicle/${event_vehicle}`, params);
  return response.data.data ?? response.data;
};

export const get_detail_vehicle = async (event_vehicle: string) => {
  const response = await api.get(`vehicle/${event_vehicle}`);
  return response.data.data ?? response.data;

}

export const delete_vehicle = async (event_vehicle: string) => {
  const response = await api.delete(`vehicle/${event_vehicle}`)
  return response.data.data ?? response.data;
}

export const assign_vehicle = async (params: AssignVehiclePayload) => {
  const response = await api.post(`vehicle/assign`, params);
  return response.data.data ?? response.data;
}

export const get_vehicle_assignment: (vehicleId: string) => Promise<VEHICLE_WITH_ASSIGNMENT> = async (vehicleId: string) => {
  const response = await api.get(`vehicle/assign/${vehicleId}`);
  console.log(`This is the assigned vehicle d🦓🦓🦓🦓🦓🦓🦓🦓ata `, response.data.data ?? response.data);
  return response.data.data ?? response.data;
}
