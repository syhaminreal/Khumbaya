import { create } from "zustand";
import { EventVehicle } from "../type";

export interface EventVehicleDraftStore{
    draft:EventVehicle | null  , 
    setDraft:(draft:EventVehicle) =>void ;
    clearDraft:()=>void
}
export const useEventvehicleStore = create<EventVehicleDraftStore>((set) => ({
  draft: null,
  setDraft: (draft) => set({ draft }),
  clearDraft: () => set({ draft: null }),
}));


