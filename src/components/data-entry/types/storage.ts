import { DataPoint, ScaleState } from '@/types/base';
import { UploadHistoryItem } from './index';

export interface StorageState {
  data?: DataPoint[];
  scales?: ScaleState;
  uploadHistory?: UploadHistoryItem[];
}