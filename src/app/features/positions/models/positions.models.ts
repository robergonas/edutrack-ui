export interface Position {
  positionId: number;
  positionName: string;
  description?: string;
  createdAt: Date;
  createdBy?: string;
  modifiedAt?: Date;
  modifiedBy?: string;
}