import { useMutation } from '@tanstack/react-query';
import useExceptionLogger from '~/hooks/useExceptionLogger';
import { getInvoicePdf } from './api/invoices';

export const useInvoicePdf = () => {
  const exceptionLogger = useExceptionLogger();
  return useMutation({
    mutationFn: async ({ year, id }: { year: number; id: number }) => {
      const result = await getInvoicePdf(year, id);
      return result.data;
    },
    onError: (err, data) => exceptionLogger.captureException(err, { extra: data }),
  });
};
