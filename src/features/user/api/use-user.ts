import api from "@/src/api/axios";
import { UserLoginType, UserSignupType } from "@/src/features/user/types";
import { useAuthStore, User } from "@/src/store/AuthStore";
import { useDebounce } from "@/src/utils/helper";
import { ResponseFormat } from "@/src/utils/type/responce";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createUserApi,
  getFindUserWithPhone,
  getUserProfile,
  getUserWithPhone,
  resetPasswordApi,
  updateUserMeApi,
  type UpdateUserMePayload,
} from "./user.service";

interface LoginResponse {
  id: number;
  token: string;
  user: User;
}

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (credentials: UserLoginType) => {
      const { data } = await api.post<ResponseFormat<LoginResponse>>(
        "user/login",
        credentials
      );
      return data.data;
    },
    onSuccess: async (data) => {
      useAuthStore.getState().setAuth(data.token, null);
      queryClient.invalidateQueries();
      const { hydrate } = useAuthStore.getState();
      await hydrate();
    },
  });
}
export function useSignup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (credentials: UserSignupType) => {
      const data = await createUserApi(credentials);
      return data;
    },
    onSuccess: async (data) => {
      useAuthStore.getState().setAuth(data.token, null);
      queryClient.invalidateQueries();
      const { hydrate } = useAuthStore.getState();
      await hydrate();
    },
  });
}
export function useProfile() {
  const token = useAuthStore((s) => s.token);
  const setAuth = useAuthStore((s) => s.setAuth);
  const isLoading = useAuthStore((s) => s.isLoading);

  return useQuery({
    queryKey: ["profile"],
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    enabled: !isLoading && !!token,

    queryFn: async () => {
      const data = await getUserProfile();

      setAuth(token as string, {
        username: data.username,
        email: data.email,
        id: data.id,
        info: data.info ?? null,
        dob: data.dob ?? null,
        city: data.city ?? null,
        zip: data.zip ?? null,
        address: data.address ?? null,
        coverPhoto: data.coverPhoto ?? null,
        photo: data.photo ?? null,
        isActivated: data.isActivated ?? false,
        familyId: data.familyId ?? null,
        relation: data.relation ?? null,
        foodPreference: data.foodPreference ?? null,
        country: data.country ?? null,
        bio: data.bio ?? null,
        location: data.location ?? null,
        phone: data.phone ?? "",
        accountStatus: data.accountStatus ?? null,
        createdAt: data.createdAt ?? null,
        updatedAt: data.updatedAt ?? null,
      });

      return data;
    },
  });
}

export function useUpdateUserMe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      payload: UpdateUserMePayload & { familyId?: number | null }
    ) => {
      const { familyId: _familyId, ...userPayload } = payload;
      const data = await updateUserMeApi(userPayload);
      return data;
    },
    onSuccess: async (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });

      if (variables.familyId != null) {
        queryClient.invalidateQueries({
          queryKey: ["family-members", variables.familyId],
        });
      }
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: async (data: {
      currentPassword: string;
      newPassword: string;
      confirmPassword: string;
    }) => {
      const response = await api.patch("/user", data);
      return response.data;
    },
  });
}
interface UseFindUserWithPhoneOptions {
  enabled?: boolean;
  debounceMs?: number;
}

export function useFindUserWithPhone(
  phone: string,
  { enabled = true, debounceMs = 1000 }: UseFindUserWithPhoneOptions = {}
) {
  const token = useAuthStore((s) => s.token);
  const isLoading = useAuthStore((s) => s.isLoading);
  const normalizedPhone = phone.trim();
  const debouncedPhone = useDebounce(normalizedPhone, debounceMs);

  return useQuery({
    queryKey: ["find", debouncedPhone],
    enabled: !!token && !isLoading && enabled && !!debouncedPhone,
    queryFn: async () => {
      const data = await getUserWithPhone(debouncedPhone);
      return data;
    },
  });
}

export function useResetPasswordMutation() {
  return useMutation({
    mutationFn: async (data: { userId: number; newPassword: string }) => {
      const user = await resetPasswordApi({
        userId: data.userId,
        newPassword: data.newPassword,
      });
      return user;
    },
  });
}
export function usefindUserMutation() {
  return useMutation({
    mutationFn: async (phoneNumber: string) => {
      const user = await getFindUserWithPhone(phoneNumber);
      return user;
    },
  });
}
