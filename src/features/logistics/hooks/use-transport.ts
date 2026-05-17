import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  assign_vehicle,
  createVehicle,
  CreateVehicle,
  get_vehicle_assignment,
  getEventVehicles,
  getGuestTransportation,
  update_vehicle,
  UpdateVehiclePayload
} from "../api";

import {
  AssignVehileInputType,
  LogisticsTimelineItem,
  mapToLogisticsTimeline,
  SelectTransportation
} from "../type";

export const useGuestTransportation = (eventId: string) => {
  return useQuery<SelectTransportation[]>({
    queryKey: ["logistics", "guest-transportation", eventId],
    queryFn: () => getGuestTransportation(eventId),
    enabled: !!eventId,
  });
};

export const useGetVehicle = (eventId: string) => {
  return useQuery({
    queryKey: ["logistics", "vehicle", eventId],
    queryFn: () => getEventVehicles(eventId),
    enabled: !!eventId,
  });
}

export const useGetVehicleAssignement = (vehicleId: string) => {
  return useQuery<LogisticsTimelineItem[]>({
    queryKey: ['vehicle/assign', vehicleId],
    queryFn: async () => {
      const data = await get_vehicle_assignment(vehicleId);
      return mapToLogisticsTimeline(data);
    },
    enabled: !!vehicleId
  });
}


export const useCreateVehicle = (eventId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["logistics", "create-vehicle", eventId],
    mutationFn: (params: CreateVehicle) => {

      return createVehicle(eventId, params);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["logistics", "guest-transportation", eventId],
      });
      queryClient.invalidateQueries({
        queryKey: ["logistics", "vehicle", eventId],
      });
    },
  });
};

export const useAssignVehicle = (eventId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["logistics", "assign-vehicle", eventId],
    mutationFn: (params: AssignVehileInputType) => assign_vehicle(params),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["logistics", "guest-transportation", eventId],
      });
      queryClient.invalidateQueries({
        queryKey: ["logistics", "vehicle", eventId],
      });
      queryClient.invalidateQueries({
        queryKey: ["vehicle/assign"],
      });
    },
  });
};

export const useUpdateVehicle = (eventId: string, vehicleId?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["logistics", "update-vehicle", eventId, vehicleId],
    mutationFn: (params: UpdateVehiclePayload) => {
      if (!vehicleId) {
        return Promise.reject(new Error("Vehicle id is missing."));
      }

      return update_vehicle(vehicleId, params);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["logistics", "vehicle", eventId],
      });
      queryClient.invalidateQueries({
        queryKey: ["logistics", "guest-transportation", eventId],
      });
      if (vehicleId) {
        queryClient.invalidateQueries({
          queryKey: ["vehicle/assign", vehicleId],
        });
      }
    },
  });
};
