export interface Report {
  id: number;
  year: number;
  systemId: number;
  customerId: number;
  destinationId: number;
  date: number;
  statusId: number;
  statusName?: string | null;
  isInvoiced: boolean;
  technicalReport?: string | null;
  notesHighlights?: string | null;
  attachmentsCount: number;
  reportNumber?: string | null;
  requestedBy?: string | null;
  responsibleJob?: string | null;
  responsible?: string | null;
  interventionTypeId: number;
  rightCall: boolean;
  rightCallType: number;
  finishedWork: boolean;
  systemWorking: number;
  subscriptionId?: number | null;
  price: number;
  cost: number;
  workPrice: number;
  workCost: number;
  technicianNotes?: string | null;
  sourceTypeId: number;
  reportTypeId: number;
  createdAt?: number | null;
  isScanned: boolean;
  technicians?: ReportTechnician[] | null;
  laborRows?: ReportLaborRow[] | null;
  materials?: ReportMaterial[] | null;
}

export interface ReportTechnician {
  highwayCost: number;
  kilometers: number;
  otherCost: number;
  otherDescription?: string | null;
  parkingCost: number;
  reportId: number;
  reportNumber: number;
  reportYear: number;
  technicianId: number;
  technicianName?: string | null;
  travelExpense: number;
  travelTime: number;
}

export interface ReportLaborRow {
  anomalyDescription?: string | null;
  anomalyTypeId?: number | null;
  endTime?: string | null;
  hourPrice: number;
  note?: string | null;
  overtimeType: number;
  reportId: number;
  reportYear: number;
  startTime?: string | null;
  technicianId: number;
  technicianName?: string | null;
  totalMinutes: number;
  workId: number;
  workName?: string | null;
}

export interface ReportMaterial {
  cost: number;
  description?: string | null;
  discount: number;
  economy: boolean;
  economyQuantity: number;
  measureUnit?: string | null;
  noteId?: number | null;
  price: number;
  productCode?: string | null;
  quantity: number;
  reportId: number;
  reportYear: number;
  rowId: number;
  rowType?: string | null;
  warehouseId?: number | null;
}

export interface ReportList {
  reports: Report[];
}

export interface ReportMobileIntervention {
  address?: string | null;
  attachments?: unknown[];
  city?: string | null;
  clipboard?: string | null;
  companyName?: string | null;
  creationTimestamp?: number;
  customExpenses?: number;
  customExpensesText?: string | null;
  customExpensesToConsumptive?: boolean;
  customerId: number;
  customerSignature?: string | null;
  date: number;
  ddtRecipientSignature?: string | null;
  emailCompany?: string | null;
  emailResponsible?: string | null;
  employeeSenderId?: number;
  employeeSignature?: string | null;
  employees?: unknown[];
  endTimeFirstPeriod?: number;
  endTimeSecondPeriod?: number;
  events?: unknown[];
  extraOrdinaryMaintenance?: boolean;
  hasDdtSignature?: boolean;
  hours?: number;
  id: number;
  interventionDetailCustomText?: string | null;
  interventionType?: number;
  isCarriedOutInDay?: boolean;
  isCustom?: boolean;
  isCustomerPresent?: boolean;
  isNocturnal?: boolean;
  isNotSubscribed?: boolean;
  isNotUnderWarranty?: boolean;
  isOnCall?: boolean;
  isPublicHoliday?: boolean;
  isRepair?: boolean;
  isReplaced?: boolean;
  isSent?: boolean;
  isSubscribed?: boolean;
  isTelephoneAvailability?: boolean;
  isUnderWarranty?: boolean;
  isWorkFinished?: boolean;
  kms?: number;
  lastModified?: number;
  materialDisposal?: number;
  materialUseAndConsumption?: number;
  notesHighlights?: string | null;
  numberVans?: number;
  ordinaryMaintenance?: boolean;
  problemDetected?: string | null;
  recipients?: unknown[];
  reportMaterial?: unknown[];
  requestingIntervention?: string | null;
  responsible?: string | null;
  responsibleId?: number;
  responsibleJob?: string | null;
  rightCall?: boolean;
  sendToEmployee?: boolean;
  startTimeFirstPeriod?: number;
  startTimeSecondPeriod?: number;
  systemConditions?: number;
  systemId: number;
  systemType?: number;
  systemTypeCustomText?: string | null;
  systemTypeName?: string | null;
  technicalReport?: string | null;
  telephoneAvailabilityTimestamp?: number;
  tickets?: unknown[];
  timestampInvio?: string | null;
  totalHours?: string | null;
  travelExpenses?: number;
  travelExpensesToConsumptive?: boolean;
  tripToConsumptive?: boolean;
  type?: number;
  workDescription?: number;
  workPlace?: string | null;
  year: number;
}

export interface ReportMobileInterventionList {
  reports: ReportMobileIntervention[];
}

export interface ReportSearchRequest {
  customerId?: number;
  fromDate?: string;
  includes?: string;
  pageIndex?: number;
  pageSize?: number;
  search?: string;
  statusId?: number;
  systemId?: number;
  toDate?: string;
  year?: number;
}

export interface ReportSave {
  cost?: number;
  customerId?: number;
  date?: string;
  destinationId?: number;
  finishedWork?: boolean;
  id?: number;
  interventionTypeId?: number;
  notesHighlights?: string;
  price?: number;
  reportNumber?: string;
  reportTypeId?: number;
  requestedBy?: string;
  responsible?: string;
  responsibleJob?: string;
  rightCall?: boolean;
  rightCallType?: number;
  sourceTypeId?: number;
  statusId?: number;
  subscriptionId?: number | null;
  systemId?: number;
  systemWorking?: number;
  technicalReport?: string;
  technicianNotes?: string;
  technicians?: ReportTechnician[];
  laborRows?: ReportLaborRow[];
  materials?: ReportMaterial[];
  workCost?: number;
  workPrice?: number;
  year?: number;
}

export interface ReportFromMobile {
  id?: number;
  mobileId: number;
  mobileYear: number;
  year?: number;
}
