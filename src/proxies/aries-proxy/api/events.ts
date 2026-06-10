import ariesServicesClient from '~/clients/aries-services-client';
import { Event, EventsBetweenDatesRequest } from '~/types/aries-proxy/events';

export const getEventsBetweenDates = (req: EventsBetweenDatesRequest) => {
  return ariesServicesClient.get<Event[]>('event/between-dates', { params: req });
};
