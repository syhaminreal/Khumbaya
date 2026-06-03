import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { GuestWithRoom, RoomData } from "../../hotel/types/hotel.types";
import {
  assignGiftToInvitation,
  createEventGuestCategory,
  getEventGuest,
  getEventGuestCategories,
  getGuestRoom,
  getInvitation,
  getInvitationGifts,
  importGuestlist,
  inviteGuest,
  removeInvitation,
  type CreateGuestCategoryPayload,
  type GuestCategoryOption,
  type InviteGuestPayload,
} from "./service";

export const useGetEventGuests = (eventId: number | null) => {
  return useQuery({
    queryKey: ["event-guests", eventId],
    queryFn: () => getEventGuest(eventId!),
    enabled: !!eventId,
  });
};

export const useGetInvitationsForEvent = (eventId: number | null) => {
  return useQuery({
    queryKey: ["event-invitations", eventId],
    queryFn: () => getInvitation(eventId!),
    enabled: !!eventId,
  });
};

export const useGetEventGuestCategories = (
  eventId: number | null
) => {
  return useQuery<GuestCategoryOption[]>({
    queryKey: ["event-guest-categories", eventId],
    queryFn: () => getEventGuestCategories(eventId!),
    enabled: !!eventId,
  });
};

export const useCreateEventGuestCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      eventId,
      payload,
    }: {
      eventId: number;
      payload: CreateGuestCategoryPayload;
    }) => createEventGuestCategory(eventId, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["event-guest-categories", variables.eventId],
      });
    },
  });
};


export const useImportGuestlist = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      fromEventId,
      toEventId,
    }: {
      fromEventId: number;
      toEventId: number;
    }) => importGuestlist(fromEventId, toEventId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["event-guests", variables.toEventId],
      });
      queryClient.invalidateQueries({
        queryKey: ["event-invitations", variables.toEventId],
      });
    }

  });
};

export const useInviteGuest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      eventId,
      payload,
    }: {
      eventId: number;
      payload: InviteGuestPayload;
    }) => inviteGuest(eventId, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["event-invitations", variables.eventId],
      });
      queryClient.invalidateQueries({
        queryKey: ["event-guests", variables.eventId],
      });
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
};

import { moveToDraft } from "./service";

export const useRemoveInvitation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ eventId, guestId }: { eventId: number; guestId: number }) =>
      removeInvitation(eventId, guestId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["event-invitations", variables.eventId],
      });
      queryClient.invalidateQueries({
        queryKey: ["event-guests", variables.eventId],
      });
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
};

export const useMoveToDraft = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ eventId, guestId }: { eventId: number; guestId: number }) =>
      moveToDraft(eventId, guestId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["event-invitations", variables.eventId],
      });
      queryClient.invalidateQueries({
        queryKey: ["event-guests", variables.eventId],
      });
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
};

export const useGetGuestRoom = (eventId: number | null) => {
  return useQuery<RoomData[]>({
    queryKey: ["event-guest-room", eventId],
    queryFn: async () => getGuestRoom(eventId!),
    enabled: !!eventId,
  });
};

export const useGetInvitationGifts = (invitationId: number | null) => {
  return useQuery({
    queryKey: ["invitation-gifts", invitationId],
    queryFn: () => getInvitationGifts(invitationId!),
    enabled: !!invitationId,
  });
};

export const useAssignGiftToInvitation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ invitationId, giftId }: { invitationId: number; giftId: number }) =>
      assignGiftToInvitation(invitationId, giftId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["invitation-gifts", variables.invitationId],
        
      });
    },
  });
};