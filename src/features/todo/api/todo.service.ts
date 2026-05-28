
import api from "@/src/api/axios";
import type { CreateTodoPayload, TodoColumn } from "../type";

export const getTodosApi = async () => {
  const response = await api.get("/todo");
  console.log("getTodosApi response:", response.data);
  return response.data?.data ?? response.data;
};

export const getTodosByEventIdApi = async (eventId: string) => {
  const response = await api.get(`/todo/event/${eventId}`);
  console.log(`getTodosByEventIdApi response for eventId ${eventId}:`, response.data, response.data?.data);
  return response.data?.data ?? response.data;
};

export const getTodoByIdApi = async (id: string) => {
  const response = await api.get(`/todo/${id}`);
  return response.data ?? response.data?.data;
};

export const createTodoApi = async (payload: CreateTodoPayload) => {
  const response = await api.post("/todo", payload);
  return response.data?.data ?? response.data;
};
export const deleteTodoApi = async (id: number) => {
  const response = await api.delete(`/todo/${id}`);
  return response.data?.data ?? response.data;
}

export const updateTodoApi = async (
  id: string | number,
  payload: Partial<TodoColumn>
) => {
  const response = await api.patch(`/todo/${id}`, payload);
  return response.data?.data ?? response.data;
};

export const bulkUpdateTodoStatusApi = async (updates: Array<{
  todoId: number;
  isDone: boolean;
}>) => {
  const todos = updates.map((data) => ({
    ...data,
    isDone: Boolean(data.isDone)
  }))
  const response = await api.post("/todo/bulk", {
    todos: todos
  });

  return response.data;
};
