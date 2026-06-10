import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getSupplierInvoicePayment, saveSupplierInvoicePayment } from './api/supplier-invoice-payments';
import { DashboardQueryKeys } from './dashboard';
import { SupplierInvoicePaymentSaveRequest } from '~/types/aries-proxy/supplier-invoice-payments';

export const SupplierInvoicePaymentQueryKeys = {
  all: ['SupplierInvoicePayments'] as const,
  byKey: (year: number, id: number, paymentId: number) => ['SupplierInvoicePayments', year, id, paymentId] as const,
};

export const useSupplierInvoicePayment = (year: number, id: number, paymentId: number) => {
  return useQuery({
    queryKey: SupplierInvoicePaymentQueryKeys.byKey(year, id, paymentId),
    queryFn: async () => (await getSupplierInvoicePayment(year, id, paymentId)).data,
    enabled: year > 0 && id > 0 && paymentId > 0,
  });
};

export const useSaveSupplierInvoicePayment = () => {
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
      request: SupplierInvoicePaymentSaveRequest;
      year: number;
    }) => {
      await saveSupplierInvoicePayment(year, id, paymentId, request);
    },
    onSuccess: (_data, args) =>
      Promise.all([
        queryClient.invalidateQueries({
          queryKey: SupplierInvoicePaymentQueryKeys.byKey(args.year, args.id, args.paymentId),
        }),
        queryClient.invalidateQueries({ queryKey: DashboardQueryKeys.all }),
      ]),
  });
};
