import { Event } from "@/src/constants/event";
import { User } from "@/src/store/AuthStore";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Invitation } from "../../guests/types";
import {
    acceptRsvpInvitationApi,
    CREATEEVENT,
    createEventApi,
    deleteEventGalleryImage,
    duplicateEventApi,
    getCompletedEventsApi,
    getEventById,
    getEventGallery,
    getEventOwners,
    getInvitedEvent,
    getResponsesWithUser,
    getSubEventOfEvent,
    getUpcomingEventsApi,
    makeEventMember,
    MakeEventMemberType,
    removeEventMember,
    submitRsvpResponseApi,
    updateEventApi,
    uploadEventGalleryImage,
} from "../api/events.service";

export const useCreateEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createEventApi,
    onMutate: async (newEvent: CREATEEVENT) => {
      await Promise.all([
        queryClient.cancelQueries({ queryKey: ["events/upcoming"] }),
        queryClient.cancelQueries({ queryKey: ["events/with-role"] }),
      ]);

      const previousUpcomingEvents = queryClient.getQueryData<Event[]>([
        "events/upcoming",
      ]);
    },

    onSuccess: async (_data, variables) => {
      const invalidations = [
        queryClient.invalidateQueries({ queryKey: ["events/upcoming"] }),
        queryClient.invalidateQueries({ queryKey: ["events/completed"] }),
        queryClient.invalidateQueries({ queryKey: ["events/with-role"] }),
      ];
      if (variables.parentId) {
        invalidations.push(
          queryClient.invalidateQueries({
            queryKey: ["sub-events", variables.parentId],
          })
        );
      }
      await Promise.all(invalidations);
    },
  });
};

interface EventQueryOptions {
  enabled?: boolean;
}

export const usegetUpcomingEvents = ({
  enabled = true,
}: EventQueryOptions = {}) => {
  return useQuery({
    queryKey: ["events/upcoming"],
    queryFn: () => getUpcomingEventsApi(),
    enabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
};

export const useGetInvitedEvents = ({
  enabled = true,
}: EventQueryOptions = {}) => {
  return useQuery({
    queryKey: ["rsvp-invitations"],
    queryFn: getInvitedEvent,
    enabled,
    staleTime: 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};
export const useGetCompletedEvents = ({
  enabled = true,
}: EventQueryOptions = {}) => {
  return useQuery({
    queryKey: ["events/completed"],
    queryFn: () => getCompletedEventsApi(),
    enabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
};

export const useGetEventWithRole = ({
  enabled = true,
}: EventQueryOptions = {}) => {
  return useQuery({
    queryKey: ["events/with-role"],
    enabled,
    queryFn: async () => {
      const [upcomingEvents, completedEvents] = await Promise.all([
        getUpcomingEventsApi(),
        getCompletedEventsApi(),
      ]);
      const seen = new Set<string>();
      return [...upcomingEvents, ...completedEvents].filter((e) => {
        if (seen.has(e.id)) return false;
        seen.add(e.id);
        return true;
      });
    },
    staleTime: 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useAcceptRsvpInvitation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: acceptRsvpInvitationApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rsvp-invitations"] });
      queryClient.invalidateQueries({ queryKey: ["events/upcoming"] });
      queryClient.invalidateQueries({ queryKey: ["events/completed"] });
      queryClient.invalidateQueries({ queryKey: ["events/with-role"] });
    },
  });
};

export const useEventById = (
  eventId: number,
  { enabled = true }: EventQueryOptions = {}
) => {
  return useQuery({
    queryKey: ["event", eventId],
    queryFn: async () => {
      const events = await getEventById(eventId);
      return events;
    },
    enabled: enabled && !!eventId,
  });
};

export interface EventGalleryItem {
  id: string | number;
  mediaUrl: string;
  createdAt?: string;
}

export const useEventGallery = (
  eventId?: string,
  { enabled = true }: EventQueryOptions = {}
) => {
  return useQuery({
    queryKey: ["event-gallery", eventId],
    queryFn: async () => {
      if (!eventId) {
        throw new Error("Missing event id");
      }

      const gallery = await getEventGallery(eventId);
      return gallery.map((item: EventGalleryItem) => ({
        id: String(item.id),
        uri: item.mediaUrl,
        uploadedAt: item.createdAt
          ? new Date(item.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })
          : new Date().toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            }),
      }));
    },
    enabled: enabled && !!eventId,
    staleTime: 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useUploadEventGalleryImage = (eventId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { uri: string; name: string; type: string }) =>
      uploadEventGalleryImage(eventId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event-gallery", eventId] });
    },
  });
};

export const useDeleteEventGalleryImage = (eventId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (imageId: string) => deleteEventGalleryImage(eventId, imageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event-gallery", eventId] });
    },
  });
};

export const useEventResponseWithUser = (eventId: number) => {
  return useQuery({
    queryKey: ["event-responses", eventId],
    queryFn: async () => {
      const responses = await getResponsesWithUser(eventId);
      return responses;
    },
  });
};

export const useSubmitRsvpResponse = (eventId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<Invitation>) =>
      submitRsvpResponseApi(eventId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event-responses", eventId] });
      queryClient.invalidateQueries({
        queryKey: ["event-invitations", eventId],
      });
      queryClient.invalidateQueries({ queryKey: ["event-guests", eventId] });
      queryClient.invalidateQueries({ queryKey: ["rsvp-invitations"] });
      queryClient.invalidateQueries({
        queryKey: ["event-guest-room", eventId],
      });
      queryClient.invalidateQueries({ queryKey: ["gifts", "event", eventId] });
      queryClient.invalidateQueries({
        queryKey: ["gift-categories-with-gifts", "event", eventId],
      });
    },
  });
};

export const useSubEventsOfEvent = (eventId: number) => {
  return useQuery({
    queryKey: ["sub-events", eventId],
    queryFn: async () => {
      const subEvents = await getSubEventOfEvent(eventId);
      return subEvents;
    },
    enabled: !!eventId,
  });
};

export const useMakeEventMember = (eventId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: MakeEventMemberType) =>
      makeEventMember(eventId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event-responses", eventId] });
      queryClient.invalidateQueries({ queryKey: ["rsvp-invitations"] });
      queryClient.invalidateQueries({ queryKey: ["event-owner", eventId] });
    },
  });
};
export const useGetEventOwner = (eventId: string) => {
  return useQuery({
    queryKey: ["event-owner", eventId],
    queryFn: async () => {
      const responses: {
        user: User;
        role: string;
      }[] = await getEventOwners(eventId);
      return responses;
    },
  });
};

export const useDuplicateEvent = (parentEventId?: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (eventId: string | number) => duplicateEventApi(eventId),
    onSuccess: async () => {
      if (parentEventId) {
        queryClient.invalidateQueries({
          queryKey: ["sub-events", parentEventId],
        });
        queryClient.invalidateQueries({ queryKey: ["event", parentEventId] });
      }
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["events/upcoming"] }),
        queryClient.invalidateQueries({ queryKey: ["events/completed"] }),
        queryClient.invalidateQueries({ queryKey: ["events/with-role"] }),
      ]);
    },
  });
};

export const useUpdateEvent = (eventId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (updatedEvent: Partial<Event>) =>
      updateEventApi(eventId, updatedEvent),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event", eventId] });
      queryClient.invalidateQueries({ queryKey: ["sub-events", eventId] });

      queryClient.invalidateQueries({ queryKey: ["events/upcoming"] });
      queryClient.invalidateQueries({ queryKey: ["events/completed"] });
      queryClient.invalidateQueries({ queryKey: ["events/with-role"] });
      queryClient.invalidateQueries({ queryKey: ["budget-summary", eventId] });
      queryClient.invalidateQueries({ queryKey: ["gifts", "event", eventId] });
      queryClient.invalidateQueries({
        queryKey: ["gift-categories", "event", eventId],
      });
      queryClient.invalidateQueries({
        queryKey: ["gift-categories-with-gifts", "event", eventId],
      });
    },
  });
};
export const useRemoveEventMember = (eventId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId }: { userId: number }) =>
      removeEventMember(eventId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event-owner", eventId] }); // ONly refetch the eventMember in the ui
    },
  });
};

// export const useDeleteEvent = (eventId: number) => {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: () => deleteEventApi(eventId),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["event", eventId] });
//       queryClient.invalidateQueries({ queryKey: ["events/upcoming"] });
//       queryClient.invalidateQueries({ queryKey: ["events/completed"] });
//       queryClient.invalidateQueries({ queryKey: ["events/with-role"] });
//       queryClient.invalidateQueries({ queryKey: ["budget-summary", eventId] });
//     },
//   });
// };
