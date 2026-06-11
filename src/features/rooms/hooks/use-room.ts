import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    assignGuestToRoom,
    createRoom,
    deleteRoomById,
    duplicateRoom,
    editGuestRoom,
    getRoom,
    getRoomsByEvent,
    removeGuestFromRoom,
    updateRoomById,
    type AssignRoomPayload,
} from "../api/room.service";
import type { Room } from "../api/room.service";
import { roomKeys } from "./roomKeys";

export type { Room } from "../api/room.service";

// ─── QUERY: Get all rooms for an event ────────────────────────────
export const useGetRooms = (eventId: number) => {
  return useQuery({
    queryKey: roomKeys.all(eventId),
    queryFn: () => getRoomsByEvent(eventId),
    enabled: !!eventId,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
};

// ─── QUERY: Get single room by id ───────────────────────────
export const useGetRoom = (roomId: number) => {
  return useQuery({
    queryKey: roomKeys.detail(roomId),
    queryFn: () => getRoom(roomId),
    enabled: !!roomId,
  });
};

// ─── MUTATION: Create room ─────────────────────────────────────────
export const useCreateRoom = (eventId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Omit<Room, "id">) => createRoom(eventId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roomKeys.all(eventId) });
    },
  });
};

// ─── MUTATION: Update room by id ─────────────────────────────────────
export const useUpdateRoomById = (eventId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<Room> }) =>
      updateRoomById(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roomKeys.all(eventId) });
    },
  });
};

// ─── MUTATION: Delete room by id ───────────────────────────────────
export const useDeleteRoomById = (eventId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteRoomById(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roomKeys.all(eventId) });
    },
  });
};

// ─── MUTATION: Duplicate room by id ─────────────────────────────────────
export const useDuplicateRoom = (eventId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (roomId: number) => duplicateRoom(roomId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roomKeys.all(eventId) });
    },
  });
};

// ─── MUTATION: Assign guest to room by invitationId ─────────────────────
export const useAssignGuestToRoom = (eventId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      invitationId,
      payload,
    }: {
      invitationId: number;
      payload: AssignRoomPayload;
    }) => assignGuestToRoom(invitationId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roomKeys.all(eventId) });
      queryClient.invalidateQueries({ queryKey: ["event-invitations", eventId] });
      queryClient.invalidateQueries({ queryKey: ["event-guest-room", eventId] });
    },
  });
};

// ─── MUTATION: Edit guest room assignment by invitationId ───────────────
export const useEditGuestRoom = (eventId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      invitationId,
      payload,
    }: {
      invitationId: number;
      payload: AssignRoomPayload;
    }) => editGuestRoom(invitationId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roomKeys.all(eventId) });
      queryClient.invalidateQueries({ queryKey: ["event-invitations", eventId] });
      queryClient.invalidateQueries({ queryKey: ["event-guest-room", eventId] });
    },
  });
};

// ─── MUTATION: Remove guest from room by invitationId ───────────────────
export const useRemoveGuestFromRoom = (eventId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (invitationId: number) => removeGuestFromRoom(invitationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roomKeys.all(eventId) });
      queryClient.invalidateQueries({ queryKey: ["event-invitations", eventId] });
      queryClient.invalidateQueries({ queryKey: ["event-guest-room", eventId] });
    },
  });
};
