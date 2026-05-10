import { Event } from "@/src/constants/event";
import { create } from "zustand";
interface EventStore {
  eventDraft: Event | null;
  setEventDraft: (event: Event) => void;
  clearEventDraft: () => void;
}
interface SubEventStore {
  eventDraft: Event | null;
  ParentEventId?:Event ; 
  setSubEventDraft: ({event , parentEvent}:{event: Event; parentEvent: Event}) => void;
  clearSubEventDraft: () => void;
}


//TODO: only get the sub event id and the name store
interface SubEventListStore {
  subEventList: Event[] | null;
  setSubEventList: (subEventList:Event[]) => void;
  clearSubEventList: () => void;
}

export const useSubEventListStore = create<SubEventListStore>((set) => ({
  subEventList: null,
  setSubEventList: (subEventList) => set({ subEventList }),
  clearSubEventList: () => set({ subEventList: null }),
}));

export const useEventStore = create<EventStore>((set) => ({
  eventDraft: null,
  setEventDraft: (event) => set({ eventDraft: event }),
  clearEventDraft: () => set({ eventDraft: null }),
}));

export const useSubeventDraftStore = create<SubEventStore>((set) => ({
  eventDraft: null,
  parentEvent: undefined,
  setSubEventDraft: ({event , parentEvent}: { event: Event; parentEvent: Event }) => set({ eventDraft: event, ParentEventId: parentEvent }),
  clearSubEventDraft: () => set({ eventDraft: null, ParentEventId: undefined }),
}));