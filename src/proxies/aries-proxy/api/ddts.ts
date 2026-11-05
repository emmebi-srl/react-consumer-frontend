import ariesServicesClient from '~/clients/aries-services-client';
import { DdtList, DdtSearchRequest, DdtStatusList, DdtTotals, TransportCausalList } from '~/types/aries-proxy/ddts';
import { SearchMetadata } from '~/types/aries-proxy/shared';

/** Newest first: by year, then by number. */
export const searchDdts = (req?: DdtSearchRequest) => {
  return ariesServicesClient.get<DdtList>('ddt', { params: req });
};

export const getDdtsMetadata = (req?: DdtSearchRequest) => {
  return ariesServicesClient.get<SearchMetadata>('ddt/metadata', { params: req });
};

/** Requires the totals permission of the DDT module. */
export const getDdtsTotals = (req?: DdtSearchRequest) => {
  return ariesServicesClient.get<DdtTotals>('ddt/totals', { params: req });
};

export const getDdtStatuses = () => {
  return ariesServicesClient.get<DdtStatusList>('ddt/status');
};

export const getTransportCausals = () => {
  return ariesServicesClient.get<TransportCausalList>('ddt/causal');
};
