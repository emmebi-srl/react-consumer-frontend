import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import useExceptionLogger from '~/hooks/useExceptionLogger';

import {
  createWhatsappTemplate,
  getWhatsappConversation,
  getWhatsappReceivedMessages,
  getWhatsappReceivedMessagesMetadata,
  getWhatsappTemplates,
  sendWhatsappReply,
  syncWhatsappTemplates,
} from './api/whatsapp';
import {
  WhatsappConversationReply,
  WhatsappReceivedMessageSearchRequest,
  WhatsappTemplateCreate,
} from '~/types/aries-proxy/whatsapp';

const ReceivedMessageSearchPageSize = 50;

/** New messages of the customer arrive through the Meta webhook: refresh the open conversation. */
const ConversationRefreshMs = 15_000;

export const WhatsappQueryKeys = {
  all: ['whatsapp'] as const,
  templates: ['whatsapp', 'templates'] as const,
  conversation: (phone: string) => ['whatsapp', 'conversation', phone] as const,
  receivedMessages: (params?: WhatsappReceivedMessageSearchRequest) =>
    ['whatsapp', 'received-messages', params ?? {}] as const,
  receivedMessagesMetadata: (params?: WhatsappReceivedMessageSearchRequest) =>
    ['whatsapp', 'received-messages', 'metadata', params ?? {}] as const,
};

export const useWhatsappReceivedMessages = (params?: WhatsappReceivedMessageSearchRequest) => {
  const pageSize = params?.pageSize ?? ReceivedMessageSearchPageSize;
  return useInfiniteQuery({
    queryKey: WhatsappQueryKeys.receivedMessages(params),
    queryFn: async ({ pageParam }) => {
      const res = await getWhatsappReceivedMessages({ ...params, pageIndex: pageParam, pageSize });
      return { ...res.data, pageIndex: pageParam };
    },
    initialPageParam: 1,
    getNextPageParam: (data) => (data.whatsappReceivedMessages.length < pageSize ? undefined : data.pageIndex + 1),
  });
};

export const useWhatsappReceivedMessagesMetadata = (params?: WhatsappReceivedMessageSearchRequest) => {
  return useQuery({
    queryKey: WhatsappQueryKeys.receivedMessagesMetadata(params),
    queryFn: async () => (await getWhatsappReceivedMessagesMetadata(params)).data,
  });
};

export const useWhatsappConversation = (phone?: string | null) => {
  return useQuery({
    queryKey: WhatsappQueryKeys.conversation(phone ?? ''),
    queryFn: async () => (await getWhatsappConversation(phone as string)).data,
    enabled: !!phone,
    refetchInterval: ConversationRefreshMs,
  });
};

/** The response is the updated conversation: a reply refused by Meta comes back with status "failed". */
export const useSendWhatsappReply = (phone: string) => {
  const exceptionLogger = useExceptionLogger();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: WhatsappConversationReply) => (await sendWhatsappReply(phone, data)).data,
    onError: (err) => exceptionLogger.captureException(err),
    onSuccess: (conversation) => queryClient.setQueryData(WhatsappQueryKeys.conversation(phone), conversation),
  });
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
