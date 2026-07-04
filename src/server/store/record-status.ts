export const RECORD_STATUS = { ACTIVE: 1, DELETED: 2 } as const;
export type RecordStatus = (typeof RECORD_STATUS)[keyof typeof RECORD_STATUS];
