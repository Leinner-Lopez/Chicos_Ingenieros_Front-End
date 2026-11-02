export type BackupType = 'MANUAL' | 'PRE_RESTORE' | 'PRE_PURGE';

export interface Backup {
  backupId: number;
  fileName: string;
  createdAt: string;
  createdBy: string;
  sizeBytes: number;
  recordCount: number;
  checksum: string;
  type: BackupType;
}

export interface BackupOperationResponse {
  message: string;
  safetyBackup: Backup;
}

export interface ApiError {
  timeStamp: string;
  message: string;
  path: string;
  errorCode: string;
}
