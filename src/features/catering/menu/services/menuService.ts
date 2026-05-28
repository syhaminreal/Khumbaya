import api from "@/src/api/axios";
import {
  CreateMenuPayload,
  CreateMenuResponse,
  MenuItemColumn,
  UpdateMenuPayload,
  UpdateMenuResponse,
} from "../types";

export const menuService = {
  getMenuList: async (cateringId: number, page = 1, limit = 10) => {
    const response = await api.get<{ data: MenuItemColumn[] }>(`/catering/${cateringId}/menu`, {
      params: { page, limit }
    });
    return response.data.data;
  },

  getMenuById: async (menuId: number): Promise<MenuItemColumn> => {
    const response = await api.get<{ data: MenuItemColumn }>(`/menu/${menuId}`);
    return response.data.data;
  },

  createMenu: async (
    cateringId: number,
    payload: CreateMenuPayload
  ): Promise<CreateMenuResponse> => {
    const response = await api.post<{ data: CreateMenuResponse }>(
      `/catering/${cateringId}/menu`,
      payload
    );
    return response.data.data;
  },

  updateMenu: async (
    menuId: number,
    payload: UpdateMenuPayload
  ): Promise<UpdateMenuResponse> => {
    const response = await api.patch<{ data: UpdateMenuResponse }>(
      `/menu/${menuId}`,
      payload
    );
    return response.data.data;
  },

  deleteMenu: async (menuId: number): Promise<{ success: boolean }> => {
    const response = await api.delete<{ data: { success: boolean } }>(
      `/menu/${menuId}`
    );
    return response.data.data;
  },
};
