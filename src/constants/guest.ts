import * as z from "zod";

export type CategoryPriority = 1 | 2 | 3;

export const PRIORITY_OPTIONS: Array<{ label: string; value: CategoryPriority }> = [
  { label: "1", value: 1 },
  { label: "2", value: 2 },
  { label: "3", value: 3 },
];

export const guestDetailSchema = z.object({
  category: z.string().optional(),
  assignedRoom: z.string().optional(),
  arrivalInfo: z.string().optional(),
  departureInfo: z.string().optional(),
  notes: z.string().optional(),
});

export type GuestDetailFormData = z.infer<typeof guestDetailSchema>;