import { useQuery } from '@tanstack/react-query';
import { getEventsBetweenDates } from './api/events';
import { EventsBetweenDatesRequest } from '~/types/aries-proxy/events';

export const EventsQueryKeys = {
  all: ['Events'] as const,
  betweenDates: (params: EventsBetweenDatesRequest) => ['Events', 'between-dates', params] as const,
};

export const useEventsBetweenDates = (params: EventsBetweenDatesRequest) => {
  return useQuery({
    queryKey: EventsQueryKeys.betweenDates(params),
    queryFn: async () => (await getEventsBetweenDates(params)).data,
  });
};
