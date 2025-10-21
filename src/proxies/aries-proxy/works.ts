import { useQuery } from '@tanstack/react-query';
import _isEmpty from 'lodash/isEmpty';
import { getWorksToDoByAddress, WorksToDoByAddressFilter } from './api/works';

export const WorksQueryKeys = {
  toDoByAddress: (filter: WorksToDoByAddressFilter) => ['works', 'todo', 'byAddress', filter] as const,
};

export const useWorksToDoByAddress = (filter: WorksToDoByAddressFilter) => {
  return useQuery({
    queryKey: WorksQueryKeys.toDoByAddress(filter),
    queryFn: async () => {
      const response = await getWorksToDoByAddress(filter);
      return response.data;
    },
    enabled: !_isEmpty(filter.address) || !_isEmpty(filter.city) || !_isEmpty(filter.postalCode),
  });
};
