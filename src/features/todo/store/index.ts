import { create } from "zustand";
import { TodoColumn } from "../type/index";

interface TodoDraftStoreInterface {
  todoDraft: TodoColumn | null;
  setTodoDetail: (detail: TodoColumn) => void;
  clearTodoDetail: () => void;
}

export const useTodoDraftStore = create<TodoDraftStoreInterface>((set) => ({
  todoDraft: null,
  setTodoDetail: (detail) => set({ todoDraft: detail }),
  clearTodoDetail: () => set({ todoDraft: null }),
}));

interface TodoListStoreInterface {
  todos: TodoColumn[];
  setTodos: (todos: TodoColumn[]) => void;
  toggleTodoStatus: (id: number) => void;
  clearTodos: () => void;
}

export const useTodoListStore = create<TodoListStoreInterface>((set) => ({
  todos: [],
  setTodos: (todos) => set({ todos }),
  clearTodos: () => set({ todos: [] }),
  toggleTodoStatus: (id) =>
    set((state) => ({
      todos: state.todos.map((t) =>
        t.id === id
          ? {
              ...t,
              isDone: !t.isDone,
              status: !t.isDone ? "completed" : "pending",
            }
          : t
      ),
    })),
}));

