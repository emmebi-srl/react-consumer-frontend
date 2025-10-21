import { Customer } from './customers';
import { System } from './systems';

export enum ChecklistMasterSlaveEnum {
  Master = 1,
  Slave = 2,
}

export enum ChecklistToggleConfirmEnum {
  Yes = 1,
  No = 2,
  NotApplicable = 3,
}

export enum ChecklistSnmpVersionEnum {
  V1 = 1,
  V2 = 2,
  V3 = 3,
}

export enum ChecklistSuctionSystemTypeEnum {
  None = 0,
  Normal = 1,
  HighSensitivity = 2,
  Laser = 3,
}

export interface ChecklistsResponse {
  list: Checklist[];
}

export interface Checklist {
  id: number;
  mobileId: number;
  executionDate: number;
  employeeId: number;
  customerId: number;
  customerName: string;
  customerAddress: string;
  customerCity: string;
  systemCentral: string;
  systemInstalledPlace: string;
  systemInstalledDate: number;
  systemDepartments: string;
  systemId: number;
  responsableId?: number | null;
  responsableName?: string | null;
  checklistModelId: number;
  creationTimestamp: number;
  employeeSignature?: string | null;
  customerSignature?: string | null;
  others?: string | null;
  notes?: string | null;
  responsableJob?: string;
  periodicCheck: number;
  visitNumber: number;
  isViewed: boolean;
  isPrinted: boolean;
  isSent: boolean;
  paragraphs?: ChecklistParagraph[];
  employees?: null;
  reports?: ChecklistReport[] | null;
  system?: System | null;
  customer?: Customer | null;
}

export interface ChecklistReport {
  checklistId: number;
  reportId: number;
  reportYear: number;
}

export interface ChecklistEmployee {
  checklistId: number;
  employeeId: number;
}

export interface ChecklistParagraph {
  id: number;
  checklistId: number;
  name: string;
  description: string;
  order: number;
  paragraphModelId: number;
  rows?: ChecklistRow[] | null;
}

export interface ChecklistRow {
  id: number;
  checklistId: number;
  paragraphId: number;
  data: Data;
  rowType: number;
  rowModelId: number;
  paragraphModelId: number;
  checklistModelId: number;
  order: number;
  name: string;
  description: string;
  employeeIndications: string;
}

export interface ChecklistRowData {
  nameValuePairs:
    | ChecklistRowDataToggleNullConfirmQty
    | ChecklistRowDataBatterySpec
    | ChecklistRowDataCentralInfo
    | ChecklistRowDataConfigurationLan
    | ChecklistRowDataDateNotes
    | ChecklistRowDataInfoAndPrecautions
    | ChecklistRowDataInstrumMeasures
    | ChecklistRowDataToggleConfirm
    | ChecklistRowDataSuctionSystem
    | ChecklistRowDataSuctionSystemTube
    | ChecklistRowDataPowerSupplyInfo
    | ChecklistRowDataNotes
    | ChecklistRowDataMasterSlave;
}

export interface ChecklistRowDataToggleNullConfirmQty {
  value?: ChecklistToggleConfirmEnum;
  quantity?: number;
  tested?: number;
  notes: string;
  isValid: boolean;
}

export interface ChecklistRowDataHeader {
  header: string;
}

export interface ChecklistRowDataToggleNullConfirm {
  value?: ChecklistToggleConfirmEnum;
  notes: string;
  isValid: boolean;
}

export interface ChecklistRowDataMasterSlave {
  master_slave?: ChecklistMasterSlaveEnum;
  slave_id?: string;
  notes?: string;
  isValid: boolean;
}

export interface ChecklistRowDataNotes {
  notes: string;
  isValid: boolean;
}

// ===== ChecklistRowPowerSupplyInfoDTO.kt =====
export interface ChecklistRowDataPowerSupplyInfo {
  brand?: string;
  model?: string;
  position?: string;
  ampere?: number;
  notes?: string;
  isValid: boolean;
}

export interface ChecklistRowDataSuctionSystem {
  suction_system_type?: ChecklistSuctionSystemTypeEnum;
  sensor_number?: string;
  brand?: string;
  model?: string;
  position?: string;
  tubes: {
    tube_number?: number;
    alarm_time?: number;
    notes: string;
  }[];
  notes: string;
  isValid: boolean;
}

export interface ChecklistRowDataSuctionSystemTube {
  tube_number?: number;
  alarm_time?: number;
  notes: string;
}

export interface ChecklistRowDataToggleConfirm {
  value?: ChecklistToggleConfirmEnum;
  notes: string;
  isValid: boolean;
}

export interface ChecklistRowDataInstrumMeasures {
  start_voltage?: number;
  next_voltage?: number;
  rest_absorption?: number;
  alarm_absorption?: number;
  hour_autonomy?: number;
  notes: string;
  isValid: boolean;
}

export interface ChecklistRowDataInfoAndPrecautions {
  value: boolean;
  isValid: boolean;
}

export interface ChecklistRowDataDateNotes {
  date: number;
  notes?: string;
  isValid: boolean;
}

export interface ChecklistRowDataConfigurationLan {
  serial_number?: string;
  internal_ip?: string;
  external_ip?: string;
  ports?: string;
  username?: string;
  password?: string;
  peer_to_peer: boolean;
  peer_to_peer_notes?: string;
  snmp_version?: ChecklistSnmpVersionEnum;
  ping?: string;
  ddns_server?: string;
  ddns_username?: string;
  ddns_password?: string;
  notes: string;
  isValid: boolean;
}

export interface ChecklistRowDataCentralInfo {
  brand?: string;
  model?: string;
  position?: string;
  notes: string;
  master_slave?: ChecklistMasterSlaveEnum;
  slave_id?: string;
  isValid: boolean;
}

export interface ChecklistRowDataBatterySpec {
  quantity?: number;
  ampere?: number;
  month?: number;
  year?: number;
  notes: string;
  isValid: boolean;
}
