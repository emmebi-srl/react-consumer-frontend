export interface CompanySettings {
  businessName: string;
  sector?: string | null;
  address?: string | null;
  number?: string | null;
  postalCode?: string | null;
  municipality?: string | null;
  province?: string | null;
  hamlet?: string | null;
  phoneNumber?: string | null;
  mobileNumber?: string | null;
  fax?: string | null;
  email?: string | null;
  website?: string | null;
  vatNumber?: string | null;
  fiscalCode?: string | null;
  isRegisteredInBusinessesRegister: boolean;
  isRegisteredInProvincialRegister: boolean;
  businessesRegisterProvince?: string | null;
  businessesRegisterNumber?: string | null;
  provincialRegisterProvince?: string | null;
  provincialRegisterNumber?: string | null;
  reaNumber?: string | null;
  inpsPosition?: string | null;
  inailPosition?: string | null;
  atecoCode?: string | null;
  rctInsurance?: string | null;
  shareCapital?: string | null;
  enabling?: string | null;
  smtp?: string | null;
  port?: string | null;
  ssl: boolean;
  emailUsername?: string | null;
  emailPassword?: string | null;
  emailFrom?: string | null;
  bankName?: string | null;
  iban?: string | null;
  priceListId: number;
  discount: number;
  discountType: number;
  printCompanyName: boolean;
  printRi: boolean;
  daysReminderPaymentInvoices: number;
  reminderPrinter?: string | null;
  administrationEmail?: string | null;
  reminderHeader?: string | null;
  enableReportValidation?: boolean | null;
  warningInvoiceElectronicallyPath?: string | null;
  circularWarrantyPath?: string | null;
  subscriptionRequestDaysReminder?: number | null;
  subscriptionRequestDaysNotAccepted?: number | null;
  versionUpgradePath?: string | null;
  multipleReportsDaysNotice?: number | null;
  taxRegime?: string | null;
}

export interface CompanyLogo {
  fileName?: string | null;
  contentType: string;
  base64Content: string;
}

export interface BankAccountBalance {
  id?: number;
  bankAccountId?: number;
  balanceDate: number;
  amount: number;
  notes?: string | null;
}

export interface Bank {
  id: number;
  name: string;
  abi?: string | null;
}

export interface BankAccount {
  id?: number;
  name: string;
  bankId?: number | null;
  bank?: Bank | null;
  iban?: string | null;
  holder?: string | null;
  notes?: string | null;
  isActive: boolean;
  latestBalance?: BankAccountBalance | null;
}

export interface BankAccountList {
  list: BankAccount[];
}

export interface BankAccountBalanceList {
  list: BankAccountBalance[];
}

export interface BankList {
  list: Bank[];
}
