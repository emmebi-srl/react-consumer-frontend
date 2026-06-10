import { useQuery } from '@tanstack/react-query';
import { getEmployees } from './api/employees';

export const EmployeesQueryKeys = {
  all: ['Employees'] as const,
};

export const useEmployees = () => {
  return useQuery({
    queryKey: EmployeesQueryKeys.all,
    queryFn: async () => (await getEmployees()).data,
  });
};
