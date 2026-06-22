import { useMutation, useQuery } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import queryClient from '~/clients/query-client';
import useExceptionLogger from '~/hooks/useExceptionLogger';
import { BankAccount, BankAccountBalance, CompanyLogo, CompanySettings } from '~/types/aries-proxy/company';
import {
  createBankAccount,
  createBankAccountBalance,
  createCompanySettings,
  deleteBankAccountBalance,
  getBankAccountBalances,
  getBankAccounts,
  getBanks,
  getCompanyLogo,
  getCompanySettings,
  updateBankAccount,
  updateCompanyLogo,
  updateCompanySettings,
} from './api/company';

export const CompanyQueryKeys = {
  detail: ['company'] as const,
  logo: ['company', 'logo'] as const,
};

export const BankAccountQueryKeys = {
  list: ['bank-accounts'] as const,
  banks: (searchText: string) => ['bank-accounts', 'banks', searchText] as const,
  balances: (id: number) => ['bank-accounts', id, 'balances'] as const,
};

export const useCompanySettings = () => {
  return useQuery({
    queryKey: CompanyQueryKeys.detail,
    queryFn: async () => (await getCompanySettings()).data,
  });
};

export const useUpdateCompanySettings = () => {
  const exceptionLogger = useExceptionLogger();

  return useMutation({
    mutationFn: async (model: CompanySettings) => (await updateCompanySettings(model)).data,
    onSuccess: (data) => {
      queryClient.setQueryData(CompanyQueryKeys.detail, data);
    },
    onError: (err, data) => exceptionLogger.captureException(err, { extra: { data } }),
  });
};

export const useCreateCompanySettings = () => {
  const exceptionLogger = useExceptionLogger();

  return useMutation({
    mutationFn: async (model: CompanySettings) => (await createCompanySettings(model)).data,
    onSuccess: (data) => {
      queryClient.setQueryData(CompanyQueryKeys.detail, data);
    },
    onError: (err, data) => exceptionLogger.captureException(err, { extra: { data } }),
  });
};

export const useCompanyLogo = () => {
  return useQuery({
    queryKey: CompanyQueryKeys.logo,
    queryFn: async () => {
      try {
        return (await getCompanyLogo()).data;
      } catch (err) {
        if (isAxiosError(err) && err.response?.status === 404) return null;
        throw err;
      }
    },
    retry: false,
  });
};

export const useUpdateCompanyLogo = () => {
  const exceptionLogger = useExceptionLogger();

  return useMutation({
    mutationFn: async (model: CompanyLogo) => (await updateCompanyLogo(model)).data,
    onSuccess: (data) => {
      queryClient.setQueryData(CompanyQueryKeys.logo, data);
    },
    onError: (err, data) => exceptionLogger.captureException(err, { extra: { data } }),
  });
};

export const useBankAccounts = () => {
  return useQuery({
    queryKey: BankAccountQueryKeys.list,
    queryFn: async () => (await getBankAccounts()).data.list,
  });
};

export const useBanks = (searchText: string) => {
  return useQuery({
    queryKey: BankAccountQueryKeys.banks(searchText),
    queryFn: async () => (await getBanks(searchText)).data.list,
  });
};

export const useCreateBankAccount = () => {
  const exceptionLogger = useExceptionLogger();

  return useMutation({
    mutationFn: async (model: BankAccount) => (await createBankAccount(model)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BankAccountQueryKeys.list });
    },
    onError: (err, data) => exceptionLogger.captureException(err, { extra: { data } }),
  });
};

export const useUpdateBankAccount = () => {
  const exceptionLogger = useExceptionLogger();

  return useMutation({
    mutationFn: async ({ id, model }: { id: number; model: BankAccount }) => (await updateBankAccount(id, model)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BankAccountQueryKeys.list });
    },
    onError: (err, data) => exceptionLogger.captureException(err, { extra: { data } }),
  });
};

export const useBankAccountBalances = (id: number) => {
  return useQuery({
    enabled: Boolean(id),
    queryKey: BankAccountQueryKeys.balances(id),
    queryFn: async () => (await getBankAccountBalances(id)).data.list,
  });
};

export const useCreateBankAccountBalance = () => {
  const exceptionLogger = useExceptionLogger();

  return useMutation({
    mutationFn: async ({ id, model }: { id: number; model: BankAccountBalance }) =>
      (await createBankAccountBalance(id, model)).data,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: BankAccountQueryKeys.list });
      queryClient.invalidateQueries({ queryKey: BankAccountQueryKeys.balances(variables.id) });
    },
    onError: (err, data) => exceptionLogger.captureException(err, { extra: { data } }),
  });
};

export const useDeleteBankAccountBalance = () => {
  const exceptionLogger = useExceptionLogger();

  return useMutation({
    mutationFn: async ({ id, balanceId }: { id: number; balanceId: number }) => {
      await deleteBankAccountBalance(id, balanceId);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: BankAccountQueryKeys.list });
      queryClient.invalidateQueries({ queryKey: BankAccountQueryKeys.balances(variables.id) });
    },
    onError: (err, data) => exceptionLogger.captureException(err, { extra: { data } }),
  });
};
