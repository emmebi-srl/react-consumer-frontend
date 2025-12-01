import { useMutation, useQuery } from '@tanstack/react-query';
import _isEmpty from 'lodash/isEmpty';
import { createChecklistSystemLink, getChecklistById, getChecklistPdf, getChecklists } from './api/checklists';
import useExceptionLogger from '~/hooks/useExceptionLogger';

export const ChecklistsQueryKeys = {
  search: (searchText: string) => ['Checklists', 'search', searchText] as const,
  byId: (checklistId: number) => ['Checklists', checklistId] as const,
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const useChecklistsSearch = (_searchText: string) => {
  return useQuery({
    queryKey: ChecklistsQueryKeys.search(''),
    queryFn: async () => {
      const response = await getChecklists({
        includes: ['customer', 'system'],
      });
      return response.data;
    },
  });
};

export const useChecklistById = (checklistId: number) => {
  return useQuery({
    queryKey: ChecklistsQueryKeys.byId(checklistId),
    queryFn: async () => {
      const response = await getChecklistById({
        id: checklistId,
        includes: ['customer', 'system', 'paragraphs', 'paragraphs.rows'],
      });
      return response.data;
    },
  });
};

export const useChecklistPdf = () => {
  const exceptionLogger = useExceptionLogger();
  return useMutation({
    mutationFn: async ({ checklistId }: { checklistId: number }) => {
      const result = await getChecklistPdf({ id: checklistId });
      const fileURL = URL.createObjectURL(result.data);
      window.open(fileURL);
    },
    onError: (error, data) => {
      exceptionLogger.captureException(error, { extra: data });
    },
  });
};

export const useCreateChecklistSystemLink = () => {
  const exceptionLogger = useExceptionLogger();
  return useMutation({
    mutationFn: async ({ checklistId }: { checklistId: number }) => {
      await createChecklistSystemLink({ id: checklistId });
    },
    onError: (error, data) => {
      exceptionLogger.captureException(error, { extra: data });
    },
  });
};
