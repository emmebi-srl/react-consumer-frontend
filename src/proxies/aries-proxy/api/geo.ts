import ariesServicesClient from '~/clients/aries-services-client';
import { ComuneList, FrazioneList } from '~/types/aries-proxy/geo';

export const searchComune = (search: string) => {
  return ariesServicesClient.get<ComuneList>('geo/comune', { params: { search } });
};

export const getFrazioniByComune = (comuneId: number) => {
  return ariesServicesClient.get<FrazioneList>(`geo/comune/${comuneId}/frazione`);
};
