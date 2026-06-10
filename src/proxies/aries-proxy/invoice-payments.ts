import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getInvoicePayment, saveInvoicePayment } from './api/invoice-payments';
import { DashboardQueryKeys } from './dashboard';
import { InvoicePaymentSaveRequest } from '~/types/aries-proxy/invoice-payments';

export const InvoicePaymentQueryKeys = {
  all: ['InvoicePayments'] as const,
  byKey: (year: number, id: number, paymentId: number) => ['InvoicePayments', year, id, paymentId] as const,
};

export const useInvoicePayment = (year: number, id: number, paymentId: number) => {
  return useQuery({
    queryKey: InvoicePaymentQueryKeys.byKey(year, id, paymentId),
    queryFn: async () => (await getInvoicePayment(year, id, paymentId)).data,
    enabled: year > 0 && id > 0 && paymentId > 0,
  });
};

export const useSaveInvoicePayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      paymentId,
      request,
      year,
    }: {
      id: number;
      paymentId: number;
      request: InvoicePaymentSaveRequest;
      year: number;
    }) => {
      await saveInvoicePayment(year, id, paymentId, request);
    },
    onSuccess: (_data, args) =>
      Promise.all([
        queryClient.invalidateQueries({
          queryKey: InvoicePaymentQueryKeys.byKey(args.year, args.id, args.paymentId),
        }),
        queryClient.invalidateQueries({ queryKey: DashboardQueryKeys.all }),
      ]),
  });
};
