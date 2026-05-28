import { TODO_CATEGORIES } from "@/src/constants/todo";
import { User } from "@/src/store/AuthStore";
import { z } from "zod";

export interface TodoColumn {
  id?: number;
  eventId: number | null;
  task: string | null;
  doneByuserIds?: number[] | null;
  assignedTo?: number | null;
  title: string | null;
  assignedGroup:"Guest" | "Planning Committee" | "Vendor" | null; 
  assignedUser?: User | null;
  parentId: number | null;
  category: string | null;
  dueDate: Date | string | null;
  createdAt?: Date | string | null;
  updatedAt?: Date | string | null;
}

export interface TODOListResponse {
  data: TodoColumn[];

}


export const CreatetodoValidationSchema = z.object({
  eventId: z.number().optional().nullable(),
  task: z.string().max(200).optional().nullable(),
  isDone: z.boolean().optional().nullable(),
  assignedTo: z.number().optional().nullable(),
  assignedGroup: z.enum(["Guest", "Planning Committee", "Vendor"]).optional().nullable(),
  title: z.string().optional().nullable(),
  category: z.enum(TODO_CATEGORIES).optional(),
  parentId: z.number().optional().nullable(),
  dueDate: z.union([z.string(), z.date()]).optional().nullable(),
  status: z.string().max(30).optional().nullable(),
});

const updateTodoValidationSchema = CreatetodoValidationSchema.partial();

export type updateTodoValidationSchema = z.infer<typeof updateTodoValidationSchema>;
export type CreateTodoInput = z.infer<typeof CreatetodoValidationSchema>;
export type CreateTodoPayload = Omit<TodoColumn, "id" | "createdAt" | "updatedAt">;  
