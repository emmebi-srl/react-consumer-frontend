import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import useExceptionLogger from '~/hooks/useExceptionLogger';

import { createWhatsappTemplate, getWhatsappTemplates, syncWhatsappTemplates } from './api/whatsapp';
import { WhatsappTemplateCreate } from '~/types/aries-proxy/whatsapp';

export const WhatsappQueryKeys = {
  all: ['whatsapp'] as const,
  templates: ['whatsapp', 'templates'] as const,
};

export const useWhatsappTemplates = () => {
  return useQuery({
    queryKey: WhatsappQueryKeys.templates,
    queryFn: async () => (await getWhatsappTemplates()).data,
  });
};

export const useCreateWhatsappTemplate = () => {
  const exceptionLogger = useExceptionLogger();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: WhatsappTemplateCreate) => (await createWhatsappTemplate(data)).data,
    onError: (err) => exceptionLogger.captureException(err),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: WhatsappQueryKeys.templates }),
  });
};

export const useSyncWhatsappTemplates = () => {
  const exceptionLogger = useExceptionLogger();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => (await syncWhatsappTemplates()).data,
    onError: (err) => exceptionLogger.captureException(err),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: WhatsappQueryKeys.templates }),
  });
};
