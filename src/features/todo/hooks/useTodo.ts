import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  bulkUpdateTodoStatusApi,
  createTodoApi,
  deleteTodoApi,
  getTodoByIdApi,
  getTodosApi,
  getTodosByEventIdApi,
  updateTodoApi,
} from "../api/todo.service";
import type { CreateTodoPayload, TodoColumn } from "../type";

export const useTodos = () => {
  return useQuery({
    queryKey: ["todos"],
    queryFn: getTodosApi,
  });
};

export const useTodosByEventId = (eventId: number | null) => {
  return useQuery({
    queryKey: ["todos", "event", eventId],
    queryFn: () => getTodosByEventIdApi(eventId as number),
    enabled: typeof eventId === "number",
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    select: (data) => data,
  });
};

export const useTodoById = (id: number | null) => {
  return useQuery({
    queryKey: ["todo", id],
    queryFn: () => getTodoByIdApi(id as number),
    enabled: typeof id === "number",
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useCreateTodo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateTodoPayload) => createTodoApi(payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
      queryClient.invalidateQueries({
        queryKey: ["todos", "event", variables.eventId],
      });
    },
  });
};

export const useUpdateTodo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: Partial<TodoColumn>;
      eventId?: number | null;
    }) => updateTodoApi(id, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["todo", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["todos"] });
      if (typeof variables.eventId === "number") {
        queryClient.invalidateQueries({
          queryKey: ["todos", "event", variables.eventId],
        });
        return;
      }
      queryClient.invalidateQueries({ queryKey: ["todos", "event"] });
    },
  });
};

export const useDeleteTodo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
    }: {
      id: number;
      eventId?: number | null;
    }) => deleteTodoApi(id),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["todo", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["todos"] });
      if (typeof variables.eventId === "number") {
        queryClient.invalidateQueries({
          queryKey: ["todos", "event", variables.eventId],
        });
        return;
      }
      queryClient.invalidateQueries({ queryKey: ["todos", "event"] });
    },
  });
};

export const useBulkUpdateTodoStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (updates: Array<{ todoId: number; isDone: boolean; status: string }>) =>
      bulkUpdateTodoStatusApi(updates),
    onMutate: async (updates) => {
      await queryClient.cancelQueries({ queryKey: ["todos"] });

      const previousTodos = queryClient.getQueryData(["todos"]);

      queryClient.setQueryData(["todos"], (old: any) => {
        if (!old) return old;
        const list = Array.isArray(old) ? old : (old as any).data;
        const newList = list.map((t: TodoColumn) => {
          const update = updates.find((u) => u.todoId === t.id);
          return update ? { ...t, isDone: update.isDone, status: update.status } : t;
        });
        return Array.isArray(old) ? newList : { ...old, data: newList };
      });

      return { previousTodos };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousTodos) {
        queryClient.setQueryData(["todos"], context.previousTodos);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });
};