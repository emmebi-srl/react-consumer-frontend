import { useQuery } from '@tanstack/react-query';
import _isEmpty from 'lodash/isEmpty';
import { getCustomers } from './api/customers';

export const CustomersQueryKeys = {
  search: (searchText: string) => ['Customers', 'search', searchText] as const,
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const useCustomersSearch = (_searchText: string) => {
  return useQuery({
    queryKey: CustomersQueryKeys.search(''),
    queryFn: async () => {
      const response = await getCustomers();
      return response.data;
    },
  });
};
