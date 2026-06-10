export interface Event {
  id: number;
  subject: string;
  description: string;
  referenceId?: number;
  eventTypeId: number;
  wasPerformed: boolean;
  executionDate: number;
  executionStartTime: number;
  executionEndTime: number;
  hasAlarm: boolean;
  alarmDate: number;
  isRemoved: boolean;
  isReminderSent: boolean;
  insertionDate: number;
  editDate: number;
  groupId?: number;
  systemId?: number;
  customerId?: number;
}

export interface EventsBetweenDatesRequest {
  fromDate: number;
  toDate: number;
}
