import { useQuery } from '@tanstack/react-query';
import { getPaymentTypes } from './api/payment-types';

export const PaymentTypeQueryKeys = {
  all: ['PaymentTypes'] as const,
};

export const usePaymentTypes = () => {
  return useQuery({
    queryKey: PaymentTypeQueryKeys.all,
    queryFn: async () => (await getPaymentTypes()).data,
  });
};
