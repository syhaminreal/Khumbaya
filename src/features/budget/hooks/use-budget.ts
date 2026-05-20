import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addBudgetCategory,
  addExpenseToCategory,
  addPayment,
  deleteBudgetCategory,
  deleteExpense,
  deletePayment,
  getBudgetSummary,
  getCategoryDetails,
  getExpenseById,
  getPaymentById,
  updateBudgetCategory,
  updateExpense,
  updatePayment,
} from "../services/budgetService";

export const useBudgetSummary = (
  eventId: number,
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: ["budget-summary", eventId],
    queryFn: () => getBudgetSummary(eventId),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled: options?.enabled !== false,
  });
};

export const useCategoryDetails = (
  categoryId: number,
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: ["category-details", categoryId],
    queryFn: () => getCategoryDetails(categoryId),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled: categoryId > 0 && options?.enabled !== false,
  });
};

export const useBudgetCategoryMutation = (eventId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["add-budget-category", eventId],
    mutationFn: (payload: { name: string; allocatedBudget: number }) =>
      addBudgetCategory(eventId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budget-summary", eventId] });
    },
  });
};

export const useUpdateCategoryMutation = (
  categoryId: number,
  eventId: number
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["update-budget-category", categoryId],
    mutationFn: (payload: { name: string; allocatedBudget: number }) =>
      updateBudgetCategory(categoryId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["category-details", categoryId],
      });
      queryClient.invalidateQueries({ queryKey: ["budget-summary", eventId] });
    },
  });
};

export const useDeleteCategoryMutation = (
  categoryId: number,
  eventId: number
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["delete-budget-category", categoryId],
    mutationFn: () => deleteBudgetCategory(categoryId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["category-details", categoryId],
      });
      queryClient.invalidateQueries({ queryKey: ["budget-summary", eventId] });
    },
  });
};

export const useExpenseMutation = (categoryId: number, eventId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["add-expense", categoryId],
    mutationFn: (payload: {
      name: string;
      allocatedAmount: number;
      nextDueDate?: string;
      notes?: string;
      subEventid?: number;
    }) => addExpenseToCategory(categoryId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["category-details", categoryId],
      });
      queryClient.invalidateQueries({ queryKey: ["budget-summary", eventId] });
    },
  });
};

export const useExpenseById = (
  expenseId: number,
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: ["expense-details", expenseId],
    queryFn: () => getExpenseById(expenseId),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled: options?.enabled !== false,
  });
};

export const usePaymentById = (
  paymentId: number,
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: ["payment-details", paymentId],
    queryFn: () => getPaymentById(paymentId),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled: options?.enabled !== false,
  });
};

export const usePaymentMutation = (
  expenseId: number,
  categoryId: number,
  eventId: number
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["add-payment", expenseId],
    mutationFn: (payload: {
      name: string;
      amount: number;
      paidOn: string;
      mode: string;
      status: string;
      notes?: string;
    }) => addPayment(expenseId, payload),
    onSuccess: () => {
      // Refresh expense details
      queryClient.invalidateQueries({
        queryKey: ["expense-details", expenseId],
      });
      // Refresh category details
      queryClient.invalidateQueries({
        queryKey: ["category-details", categoryId],
      });
      // Refresh budget summary
      queryClient.invalidateQueries({
        queryKey: ["budget-summary", eventId],
      });
    },
  });
};

export const useUpdateExpenseMutation = (
  expenseId: number,
  categoryId: number,
  eventId: number
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["update-expense", expenseId],
    mutationFn: (payload: {
      name: string;
      allocatedAmount?: number;
      nextDueDate?: string;
      notes?: string;
      subEventid?: number;
    }) => updateExpense(expenseId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["expense-details", expenseId],
      });
      queryClient.invalidateQueries({
        queryKey: ["category-details", categoryId],
      });
      queryClient.invalidateQueries({
        queryKey: ["budget-summary", eventId],
      });
    },
  });
};

export const useDeleteExpenseMutation = (
  expenseId: number,
  categoryId: number,
  eventId: number
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["delete-expense", expenseId],
    mutationFn: () => deleteExpense(expenseId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["expense-details", expenseId],
      });
      queryClient.invalidateQueries({
        queryKey: ["category-details", categoryId],
      });
      queryClient.invalidateQueries({
        queryKey: ["budget-summary", eventId],
      });
    },
  });
};

export const useUpdatePaymentMutation = (
  paymentId: number,
  expenseId: number,
  categoryId: number,
  eventId: number
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["update-payment", paymentId],
    mutationFn: (payload: {
      name: string;
      amount: number;
      paidOn: string;
      mode: string;
      status: string;
      notes?: string;
    }) => updatePayment(paymentId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["expense-details", expenseId],
      });
      queryClient.invalidateQueries({
        queryKey: ["category-details", categoryId],
      });
      queryClient.invalidateQueries({
        queryKey: ["budget-summary", eventId],
      });
    },
  });
};

export const useDeletePaymentMutation = (
  paymentId: number,
  expenseId: number,
  categoryId: number,
  eventId: number
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["delete-payment", paymentId],
    mutationFn: () => deletePayment(paymentId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["expense-details", expenseId],
      });
      queryClient.invalidateQueries({
        queryKey: ["category-details", categoryId],
      });
      queryClient.invalidateQueries({
        queryKey: ["budget-summary", eventId],
      });
    },
  });
};
