import api from "@/src/api/axios";

export type Room = {
  id?: number;
  roomNumber: string;
  name: string;
  capacity: number;
  costPerRoom: number;
};

const unwrapData = <T>(payload: any): T => {
  return payload?.data ?? payload;
};

// GET /room/:id
export const getRoom = async (roomId: number): Promise<Room> => {
  const res = await api.get(`/room/${roomId}`);
  return unwrapData<Room>(res.data);
};

// GET /event/:eventId/room
export const getRoomsByEvent = async (eventId: number): Promise<Room[]> => {
  const res = await api.get(`/event/${eventId}/room`);
  const payload = unwrapData<Room[] | { items?: Room[] }>(res.data);
  if (Array.isArray(payload)) return payload;
  return payload?.items ?? [];
};

// POST /event/:eventId/room
export const createRoom = async (
  eventId: number,
  payload: Omit<Room, "id">
): Promise<Room> => {
  const res = await api.post(`/event/${eventId}/room`, payload);
  return unwrapData<Room>(res.data);
};

// PATCH /room/:id
export const updateRoomById = async (
  id: number,
  payload: Partial<Room>
): Promise<Room> => {
  const res = await api.patch(`/room/${id}`, payload);
  return unwrapData<Room>(res.data);
};

// DELETE /room/:id
export const deleteRoomById = async (id: number): Promise<void> => {
  await api.delete(`/room/${id}`);
};

// POST /room/:id/duplicate
export const duplicateRoom = async (roomId: number): Promise<Room> => {
  const res = await api.post(`/room/${roomId}/duplicate`);
  return unwrapData<Room>(res.data);
};

// NEW: Room assignment endpoints
export interface AssignRoomPayload {
  roomId: string | number;
}

// POST /invitation/:invitationId/assign-room
export const assignGuestToRoom = async (
  invitationId: number,
  payload: AssignRoomPayload
): Promise<any> => {
  const res = await api.post(`/invitation/${invitationId}/assign-room`, payload);
  return res.data?.data ?? res.data;
};

// PATCH /invitation/:invitationId/edit-room
export const editGuestRoom = async (
  invitationId: number,
  payload: AssignRoomPayload
): Promise<any> => {
  const res = await api.patch(`/invitation/${invitationId}/edit-room`, payload);
  return res.data?.data ?? res.data;
};

// DELETE /invitation/:invitationId/room
export const removeGuestFromRoom = async (
  invitationId: number
): Promise<any> => {
  const res = await api.delete(`/invitation/${invitationId}/room`);
  return res.data?.data ?? res.data;
};
