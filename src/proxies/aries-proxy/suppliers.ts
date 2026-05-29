import { useQuery } from '@tanstack/react-query';
import { getSuppliers } from './api/suppliers';

const SupplierAutocompletePageSize = 20;

export const SupplierQueryKeys = {
  search: (searchText: string) => ['suppliers', 'search', searchText] as const,
};

export const useSuppliersSearch = (searchText: string) => {
  return useQuery({
    queryKey: SupplierQueryKeys.search(searchText),
    queryFn: async () => {
      const response = await getSuppliers({
        search: searchText || undefined,
        pageIndex: 1,
        pageSize: SupplierAutocompletePageSize,
      });

      return response.data.suppliers;
    },
  });
};
