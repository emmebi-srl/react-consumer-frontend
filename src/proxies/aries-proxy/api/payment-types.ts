import ariesServicesClient from '~/clients/aries-services-client';
import { PaymentTypeList } from '~/types/aries-proxy/payment-types';

export const getPaymentTypes = () => {
  return ariesServicesClient.get<PaymentTypeList>('utils/payment-type');
};
