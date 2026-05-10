import { TODO_CATEGORIES, type TodoCategory } from "@/src/constants/todo";
import { User } from "@/src/store/AuthStore";
import { z } from "zod";

export interface TodoColumn {
  id?: number;
  eventId: number | null;
  task: string | null;
  isDone: boolean | null;
  category: TodoCategory |undefined;
  assignedTo: number | undefined | null;
  assignedUser: User | null | undefined;
  title: string;
  parentId: number | null;
  dueDate: Date | string | null;
  status: string | null;
  createdAt?: Date | string | null;
  updatedAt?: Date | string | null;
}

export interface TODOListResponse {
  data: TodoColumn[];

}


export const todoValidationSchema = z.object({
  eventId: z.number().optional().nullable(),
  task: z.string().max(200).optional().nullable(),
  isDone: z.boolean().optional().nullable(),
  assignedTo: z.number().optional().nullable(),
  title: z.string().optional().nullable(),
  category: z.enum(TODO_CATEGORIES).optional(),
  parentId: z.number().optional().nullable(),
  dueDate: z.union([z.string(), z.date()]).optional().nullable(),
  status: z.string().max(30).optional().nullable(),
});

const updateTodoValidationSchema = todoValidationSchema.partial() ; 

export type updateTodoValidationSchema  = z.infer<typeof updateTodoValidationSchema>;
export type CreateTodoInput = z.infer<typeof todoValidationSchema>;
export type CreateTodoPayload = Omit<TodoColumn, "id" | "createdAt" | "updatedAt">;  
