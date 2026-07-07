import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import useExceptionLogger from '~/hooks/useExceptionLogger';
import { ReportFromMobile, ReportSave, ReportSearchRequest } from '~/types/aries-proxy/reports';
import {
  createReport,
  createReportFromMobile,
  getMobileReports,
  getReportById,
  getReports,
  getReportsMetadata,
  updateReport,
} from './api/reports';

const ReportSearchPageSize = 50;

export const ReportQueryKeys = {
  all: ['Reports'] as const,
  byId: (year: number, id: number) => ['Report', year, id] as const,
  metadata: (params: ReportSearchRequest) => ['Reports', 'metadata', params] as const,
  mobile: ['Reports', 'mobile'] as const,
  search: (params: ReportSearchRequest) => ['Reports', 'search', params] as const,
};

export const useReportsSearch = (params: ReportSearchRequest) => {
  return useInfiniteQuery({
    queryKey: ReportQueryKeys.search(params),
    queryFn: async ({ pageParam }) => {
      const pageSize = params.pageSize ?? ReportSearchPageSize;
      const pageIndex = pageParam ? Number(pageParam) : (params.pageIndex ?? 1);
      const res = await getReports({ ...params, pageIndex, pageSize });
      return {
        ...res.data,
        pageParam: {
          pageIndex,
          pageSize,
        },
      };
    },
    initialPageParam: '',
    getNextPageParam: (data) => {
      if (data.reports.length < (params.pageSize ?? ReportSearchPageSize)) return undefined;
      return (Number(data.pageParam.pageIndex) + 1).toString();
    },
  });
};

export const useReportsMetadata = (params: ReportSearchRequest) => {
  return useQuery({
    queryKey: ReportQueryKeys.metadata(params),
    queryFn: async () => (await getReportsMetadata(params)).data,
  });
};

export const useMobileReports = () => {
  return useQuery({
    queryKey: ReportQueryKeys.mobile,
    queryFn: async () => (await getMobileReports()).data,
  });
};

export const useReportById = (year: number, id: number) => {
  return useQuery({
    queryKey: ReportQueryKeys.byId(year, id),
    queryFn: async () => (await getReportById(year, id)).data,
    enabled: year > 0 && id > 0,
  });
};

export const useCreateReport = () => {
  const exceptionLogger = useExceptionLogger();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: ReportSave) => (await createReport(payload)).data,
    onError: (err, data) => exceptionLogger.captureException(err, { extra: { data } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ReportQueryKeys.all }),
  });
};

export const useCreateReportFromMobile = () => {
  const exceptionLogger = useExceptionLogger();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: ReportFromMobile) => (await createReportFromMobile(payload)).data,
    onError: (err, data) => exceptionLogger.captureException(err, { extra: { data } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ReportQueryKeys.all }),
  });
};

export const useUpdateReport = () => {
  const exceptionLogger = useExceptionLogger();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ data, id, year }: { data: ReportSave; id: number; year: number }) =>
      (await updateReport(year, id, data)).data,
    onError: (err, data) => exceptionLogger.captureException(err, { extra: { data } }),
    onSuccess: (_data, variables) =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ReportQueryKeys.byId(variables.year, variables.id) }),
        queryClient.invalidateQueries({ queryKey: ReportQueryKeys.all }),
      ]),
  });
};
