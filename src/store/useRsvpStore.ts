import { GuestDetailInterface } from "@/src/features/guests/types";
import { create } from "zustand";

interface RsvpState {
  draftMembers: GuestDetailInterface[] | null;
  selectedUserId: number | null;
  setDraftMembers: (members: GuestDetailInterface[]) => void;
  setSelectedUserId: (userId: number | null) => void;
  clearDraft: () => void;
}

export const useRsvpStore = create<RsvpState>((set) => ({
  draftMembers: null,
  selectedUserId: null,
  setDraftMembers: (members) => set({ draftMembers: members }),
  setSelectedUserId: (selectedUserId) => set({ selectedUserId }),
  clearDraft: () => set({ draftMembers: null, selectedUserId: null }),
}));
