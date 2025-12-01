import ariesServicesClient from '~/clients/aries-services-client';

import {
  CampaignList,
  CampaignCreate,
  CampaignUpdate,
  CampaignSearchRequest,
  CampaignTypeList,
  CampaignTypeCreate,
  CampaignTypeUpdate,
  CampaignPlaceholderList,
  CampaignPlaceholderCreate,
  CampaignPlaceholderUpdate,
  CampaignMailList,
  CampaignMailCreate,
  CampaignMailUpdate,
  CampaignMailDataList,
  CampaignMailDataCreate,
  CampaignMailDataUpdate,
  CampaignPlaceholderSearchRequest,
} from '~/types/aries-proxy/campaigns';
import { SearchMetadata } from '~/types/aries-proxy/shared';

//
// ------------------------------------------------------------
// CAMPAIGNS
// ------------------------------------------------------------
//

export const getCampaigns = (req: CampaignSearchRequest) => {
  return ariesServicesClient.get<CampaignList>('campaign', {
    params: req,
  });
};

export const getCampaignsMetadata = (req: CampaignSearchRequest) => {
  return ariesServicesClient.get<SearchMetadata>('campaign/metadata', {
    params: req,
  });
};

export const getCampaignById = (id: number, options?: { includes?: string }) => {
  return ariesServicesClient.get<CampaignList>(`campaign/${id}`, {
    params: options,
  });
};

export const createCampaign = (model: CampaignCreate) => {
  return ariesServicesClient.post<CampaignList>('campaign', model);
};

export const updateCampaign = (id: number, model: CampaignUpdate) => {
  return ariesServicesClient.patch<CampaignList>(`campaign/${id}`, model);
};

//
// ------------------------------------------------------------
// CAMPAIGN TYPES
// ------------------------------------------------------------
//

export const getCampaignTypes = () => {
  return ariesServicesClient.get<CampaignTypeList>('campaign/type');
};

export const getCampaignTypeById = (id: number) => {
  return ariesServicesClient.get<CampaignTypeList>(`campaign/type/${id}`);
};

export const createCampaignType = (model: CampaignTypeCreate) => {
  return ariesServicesClient.post<CampaignTypeList>('campaign/type', model);
};

export const updateCampaignType = (id: number, model: CampaignTypeUpdate) => {
  return ariesServicesClient.patch<CampaignTypeList>(`campaign/type/${id}`, model);
};

//
// ------------------------------------------------------------
// CAMPAIGN PLACEHOLDERS
// ------------------------------------------------------------
//

export const getCampaignPlaceholders = () => {
  return ariesServicesClient.get<CampaignPlaceholderList>('campaign/placeholder');
};

export const searchCampaignPlaceholders = (req: CampaignPlaceholderSearchRequest) => {
  return ariesServicesClient.get<CampaignPlaceholderList>('campaign/placeholder', {
    params: req,
  });
};

export const getCampaignPlaceholderById = (id: number) => {
  return ariesServicesClient.get<CampaignPlaceholderList>(`campaign/placeholder/${id}`);
};

export const createCampaignPlaceholder = (model: CampaignPlaceholderCreate) => {
  return ariesServicesClient.post<CampaignPlaceholderList>('campaign/placeholder', model);
};

export const updateCampaignPlaceholder = (id: number, model: CampaignPlaceholderUpdate) => {
  return ariesServicesClient.patch<CampaignPlaceholderList>(`campaign/placeholder/${id}`, model);
};

//
// ------------------------------------------------------------
// CAMPAIGN MAILS
// ------------------------------------------------------------
//

export const getCampaignMails = (campaignId: number) => {
  return ariesServicesClient.get<CampaignMailList>('campaign/mail', {
    params: { campaignId },
  });
};

export const getCampaignMailById = (id: number) => {
  return ariesServicesClient.get<CampaignMailList>(`campaign/mail/${id}`);
};

export const createCampaignMail = (model: CampaignMailCreate) => {
  return ariesServicesClient.post<CampaignMailList>('campaign/mail', model);
};

export const updateCampaignMail = (id: number, model: CampaignMailUpdate) => {
  return ariesServicesClient.patch<CampaignMailList>(`campaign/mail/${id}`, model);
};

//
// ------------------------------------------------------------
// CAMPAIGN MAIL DATA
// ------------------------------------------------------------
//

export const getCampaignMailData = (campaignMailId: number) => {
  return ariesServicesClient.get<CampaignMailDataList>('campaign/mail-data', {
    params: { campaignMailId },
  });
};

export const getCampaignMailDataById = (id: number) => {
  return ariesServicesClient.get<CampaignMailDataList>(`campaign/mail-data/${id}`);
};

export const createCampaignMailData = (model: CampaignMailDataCreate) => {
  return ariesServicesClient.post<CampaignMailDataList>('campaign/mail-data', model);
};

export const updateCampaignMailData = (id: number, model: CampaignMailDataUpdate) => {
  return ariesServicesClient.patch<CampaignMailDataList>(`campaign/mail-data/${id}`, model);
};
