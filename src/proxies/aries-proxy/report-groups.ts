import { useMutation } from '@tanstack/react-query';
import useExceptionLogger from '~/hooks/useExceptionLogger';
import { getReportGroupPdf } from './api/report-groups';

export const useReportGroupPdf = () => {
  const exceptionLogger = useExceptionLogger();
  return useMutation({
    mutationFn: async ({ year, id }: { year: number; id: number }) => {
      const result = await getReportGroupPdf(year, id);
      return result.data;
    },
    onError: (err, data) => exceptionLogger.captureException(err, { extra: data }),
  });
};
