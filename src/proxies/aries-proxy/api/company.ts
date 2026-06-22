import ariesServicesClient from '~/clients/aries-services-client';
import {
  BankAccount,
  BankAccountBalance,
  BankAccountBalanceList,
  BankAccountList,
  BankList,
  CompanyLogo,
  CompanySettings,
} from '~/types/aries-proxy/company';

export const getCompanySettings = () => {
  return ariesServicesClient.get<CompanySettings>('company');
};

export const createCompanySettings = (model: CompanySettings) => {
  return ariesServicesClient.post<CompanySettings>('company', model);
};

export const updateCompanySettings = (model: CompanySettings) => {
  return ariesServicesClient.put<CompanySettings>('company', model);
};

export const getCompanyLogo = () => {
  return ariesServicesClient.get<CompanyLogo>('company/logo');
};

export const updateCompanyLogo = (model: CompanyLogo) => {
  return ariesServicesClient.put<CompanyLogo>('company/logo', model);
};

export const getBankAccounts = (includeInactive = true) => {
  return ariesServicesClient.get<BankAccountList>('bank-accounts', { params: { includeInactive } });
};

export const getBanks = (searchText = '') => {
  return ariesServicesClient.get<BankList>('bank-accounts/banks', { params: { searchText } });
};

export const createBankAccount = (model: BankAccount) => {
  return ariesServicesClient.post<BankAccount>('bank-accounts', model);
};

export const updateBankAccount = (id: number, model: BankAccount) => {
  return ariesServicesClient.put<BankAccount>(`bank-accounts/${id}`, model);
};

export const getBankAccountBalances = (id: number) => {
  return ariesServicesClient.get<BankAccountBalanceList>(`bank-accounts/${id}/balances`);
};

export const createBankAccountBalance = (id: number, model: BankAccountBalance) => {
  return ariesServicesClient.post<BankAccountBalance>(`bank-accounts/${id}/balances`, model);
};

export const deleteBankAccountBalance = (id: number, balanceId: number) => {
  return ariesServicesClient.delete<void>(`bank-accounts/${id}/balances/${balanceId}`);
};
