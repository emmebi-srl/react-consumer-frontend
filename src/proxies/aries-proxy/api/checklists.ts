import ariesServicesClient from '~/clients/aries-services-client';
import { Checklist, ChecklistsResponse } from '~/types/aries-proxy/checklists';

export const getChecklists = ({ includes }: { includes?: string[] }) => {
  return ariesServicesClient.get<ChecklistsResponse>('checklist', {
    params: {
      includes: includes?.join(','),
    },
  });
};
export const getChecklistById = ({ includes, id }: { includes?: string[]; id: number }) => {
  return ariesServicesClient.get<ChecklistsResponse>('checklist', {
    params: {
      includes: includes?.join(','),
      id,
    },
  });
};

export const getChecklistPdf = ({ id }: { id: number }) =>
  ariesServicesClient.get<Blob>(`checklist/${id}/pdf`, {
    responseType: 'blob',
    headers: {
      Accept: 'application/pdf',
    },
  });

export const updateChecklist = ({ id, checklist }: { id: number; checklist: Checklist }) => {
  return ariesServicesClient.put<ChecklistsResponse>(`checklist/${id}`, checklist);
};

export const createChecklistSystemLink = ({ id }: { id: number }) => {
  return ariesServicesClient.post('checklist/model/createForSystem', { checklistId: id });
};
