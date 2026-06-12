export const roomKeys = {
  root: ["rooms"] as const,
  all: (eventId: number) => ["rooms", eventId] as const,
  detail: (id: number) => ["room", id] as const,
  byId: (id: number) => ["room", "id", id] as const,
};
