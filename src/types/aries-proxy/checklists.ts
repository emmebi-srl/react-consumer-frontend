import { Customer } from './customers';
import { System } from './systems';

export enum ChecklistMasterSlaveEnum {
  Master = '1',
  Slave = '2',
}

export enum ChecklistToggleConfirmEnum {
  Yes = '1',
  No = '2',
  NotApplicable = '3',
}

export enum ChecklistSnmpVersionEnum {
  V1 = '1',
  V2 = '2',
  V3 = '3',
}

export enum ChecklistSuctionSystemTypeEnum {
  None = '0',
  Normal = '1',
  HighSensitivity = '2',
  Laser = '3',
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
  checklistType?: string;
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

export type ChecklistRow = {
  id: number;
  checklistId: number;
  paragraphId: number;
  rowModelId: number;
  paragraphModelId: number;
  checklistModelId: number;
  order: number;
  name: string;
  description: string;
  employeeIndications: string;
} & (
  | {
      rowType: ChecklistRowTypeEnum.ToggleConfirm;
      data: { nameValuePairs: ChecklistRowDataToggleConfirm };
    }
  | {
      rowType: ChecklistRowTypeEnum.ToggleNullConfirmQty;
      data: { nameValuePairs: ChecklistRowDataToggleNullConfirmQty };
    }
  | {
      rowType: ChecklistRowTypeEnum.Notes;
      data: { nameValuePairs: ChecklistRowDataNotes };
    }
  | {
      rowType: ChecklistRowTypeEnum.Header;
      data: { nameValuePairs: ChecklistRowDataHeader };
    }
  | {
      rowType: ChecklistRowTypeEnum.MasterSlave;
      data: { nameValuePairs: ChecklistRowDataMasterSlave };
    }
  | {
      rowType: ChecklistRowTypeEnum.BatterySpec;
      data: { nameValuePairs: ChecklistRowDataBatterySpec };
    }
  | {
      rowType: ChecklistRowTypeEnum.InstrumMeasures;
      data: { nameValuePairs: ChecklistRowDataInstrumMeasures };
    }
  | {
      rowType: ChecklistRowTypeEnum.PowerSupplyInfo;
      data: { nameValuePairs: ChecklistRowDataPowerSupplyInfo };
    }
  | {
      rowType: ChecklistRowTypeEnum.SuctionSystem;
      data: { nameValuePairs: ChecklistRowDataSuctionSystem };
    }
  | {
      rowType: ChecklistRowTypeEnum.DateNotes;
      data: { nameValuePairs: ChecklistRowDataDateNotes };
    }
  | {
      rowType: ChecklistRowTypeEnum.ConfigurationLan;
      data: { nameValuePairs: ChecklistRowDataConfigurationLan };
    }
  | {
      rowType: ChecklistRowTypeEnum.ToggleNullConfirm;
      data: { nameValuePairs: ChecklistRowDataToggleNullConfirm };
    }
  | {
      rowType: ChecklistRowTypeEnum.InfoAndPrecautions;
      data: { nameValuePairs: ChecklistRowDataInfoAndPrecautions };
    }
  | {
      rowType: ChecklistRowTypeEnum.CentralInfo;
      data: { nameValuePairs: ChecklistRowDataCentralInfo };
    }
);

export enum ChecklistRowTypeEnum {
  ToggleConfirm = 1,
  ToggleNullConfirm = 2,
  Notes = 3,
  Header = 4,
  CentralInfo = 5,
  MasterSlave = 6,
  BatterySpec = 7,
  InstrumMeasures = 8,
  PowerSupplyInfo = 9,
  SuctionSystem = 10,
  DateNotes = 11,
  ConfigurationLan = 12,
  ToggleNullConfirmQty = 13,
  InfoAndPrecautions = 14,
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
  masterSlave?: ChecklistMasterSlaveEnum;
  slaveId?: string;
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
  suctionSystemType?: ChecklistSuctionSystemTypeEnum;
  sensorNumber?: string;
  brand?: string;
  model?: string;
  position?: string;
  tubes: {
    tubeNumber?: number;
    alarmTime?: number;
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
  startVoltage?: number;
  nextVoltage?: number;
  restAbsorption?: number;
  alarmAbsorption?: number;
  hourAutonomy?: number;
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
  serialNumber?: string;
  internalIp?: string;
  externalIp?: string;
  ports?: string;
  username?: string;
  password?: string;
  peerToPeer?: boolean;
  peerToPeerNotes?: string;
  snmpVersion?: ChecklistSnmpVersionEnum;
  ping?: string;
  ddnsServer?: string;
  ddnsUsername?: string;
  ddnsPassword?: string;
  notes: string;
  isValid: boolean;
}

export interface ChecklistRowDataCentralInfo {
  brand?: string;
  model?: string;
  position?: string;
  notes: string;
  masterSlave?: ChecklistMasterSlaveEnum;
  slaveId?: string;
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
