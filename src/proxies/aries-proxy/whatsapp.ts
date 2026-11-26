import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import useExceptionLogger from '~/hooks/useExceptionLogger';

import {
  createWhatsappTemplate,
  getWhatsappConversation,
  getWhatsappReceivedMessages,
  getWhatsappReceivedMessagesMetadata,
  getWhatsappSentMessages,
  getWhatsappSentMessagesMetadata,
  getWhatsappSettings,
  getWhatsappTemplates,
  saveWhatsappSettings,
  sendWhatsappReply,
  syncWhatsappTemplates,
} from './api/whatsapp';
import {
  WhatsappConversationReply,
  WhatsappReceivedMessageSearchRequest,
  WhatsappSentMessageSearchRequest,
  WhatsappSettings,
  WhatsappTemplateCreate,
} from '~/types/aries-proxy/whatsapp';

const ReceivedMessageSearchPageSize = 50;

/** New messages of the customer arrive through the Meta webhook: refresh the open conversation. */
const ConversationRefreshMs = 15_000;

export const WhatsappQueryKeys = {
  all: ['whatsapp'] as const,
  templates: ['whatsapp', 'templates'] as const,
  settings: ['whatsapp', 'settings'] as const,
  conversation: (phone: string) => ['whatsapp', 'conversation', phone] as const,
  receivedMessages: (params?: WhatsappReceivedMessageSearchRequest) =>
    ['whatsapp', 'received-messages', params ?? {}] as const,
  receivedMessagesMetadata: (params?: WhatsappReceivedMessageSearchRequest) =>
    ['whatsapp', 'received-messages', 'metadata', params ?? {}] as const,
  sentMessages: (params?: WhatsappSentMessageSearchRequest) => ['whatsapp', 'sent-messages', params ?? {}] as const,
  sentMessagesMetadata: (params?: WhatsappSentMessageSearchRequest) =>
    ['whatsapp', 'sent-messages', 'metadata', params ?? {}] as const,
};

const SentMessageSearchPageSize = 50;

export const useWhatsappSentMessages = (params?: WhatsappSentMessageSearchRequest) => {
  const pageSize = params?.pageSize ?? SentMessageSearchPageSize;
  return useInfiniteQuery({
    queryKey: WhatsappQueryKeys.sentMessages(params),
    queryFn: async ({ pageParam }) => {
      const res = await getWhatsappSentMessages({ ...params, pageIndex: pageParam, pageSize });
      return { ...res.data, pageIndex: pageParam };
    },
    initialPageParam: 1,
    getNextPageParam: (data) => (data.whatsappSentMessages.length < pageSize ? undefined : data.pageIndex + 1),
  });
};

export const useWhatsappSentMessagesMetadata = (params?: WhatsappSentMessageSearchRequest) => {
  return useQuery({
    queryKey: WhatsappQueryKeys.sentMessagesMetadata(params),
    queryFn: async () => (await getWhatsappSentMessagesMetadata(params)).data,
  });
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

export const useWhatsappSettings = () => {
  return useQuery({
    queryKey: WhatsappQueryKeys.settings,
    queryFn: async () => (await getWhatsappSettings()).data,
  });
};

export const useSaveWhatsappSettings = () => {
  const exceptionLogger = useExceptionLogger();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: WhatsappSettings) => (await saveWhatsappSettings(data)).data,
    onError: (err) => exceptionLogger.captureException(err),
    onSuccess: (settings) => queryClient.setQueryData(WhatsappQueryKeys.settings, settings),
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
