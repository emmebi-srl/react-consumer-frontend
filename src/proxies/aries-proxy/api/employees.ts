import ariesServicesClient from '~/clients/aries-services-client';
import { Employee } from '~/types/aries-proxy/employees';

export const getEmployees = () => {
  return ariesServicesClient.get<Employee[]>('employee');
};
