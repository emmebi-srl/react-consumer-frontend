import ariesServicesClient from '~/clients/aries-services-client';
import {
  ReportFromMobile,
  ReportList,
  ReportMobileInterventionList,
  ReportSave,
  ReportSearchRequest,
} from '~/types/aries-proxy/reports';
import { SearchMetadata } from '~/types/aries-proxy/shared';

export const getReports = (req: ReportSearchRequest) => {
  return ariesServicesClient.get<ReportList>('report/new', { params: req });
};

export const getReportsMetadata = (req: ReportSearchRequest) => {
  return ariesServicesClient.get<SearchMetadata>('report/new/metadata', { params: req });
};

export const getMobileReports = () => {
  return ariesServicesClient.get<ReportMobileInterventionList>('report/new/mobile');
};

export const getReportById = (year: number, id: number) => {
  return ariesServicesClient.get<ReportList>(`report/new/${year}/${id}`);
};

export const createReport = (model: ReportSave) => {
  return ariesServicesClient.post<ReportList>('report/new', model);
};

export const createReportFromMobile = (model: ReportFromMobile) => {
  return ariesServicesClient.post<ReportList>('report/new/from-mobile', model);
};

export const updateReport = (year: number, id: number, model: ReportSave) => {
  return ariesServicesClient.patch<ReportList>(`report/new/${year}/${id}`, model);
};
