import { DataPoint, ScaleState } from '@/types/base';
import { UploadHistoryItem } from '../types';

interface StorageState {
  data: DataPoint[];
  uploadHistory: UploadHistoryItem[];
  scales: ScaleState;
  lastUpdated: string;
}

const STORAGE_KEY = 'segmentor-state';

class StorageManager {
  private static instance: StorageManager;
  private storageAvailable: boolean;

  private constructor() {
    this.storageAvailable = this.checkStorageAvailability();
  }

  public static getInstance(): StorageManager {
    if (!StorageManager.instance) {
      StorageManager.instance = new StorageManager();
    }
    return StorageManager.instance;
  }

  private checkStorageAvailability(): boolean {
    try {
      const testKey = '__storage_test__';
      localStorage.setItem(testKey, testKey);
      localStorage.removeItem(testKey);
      return true;
    } catch (e) {
      return false;
    }
  }

  public saveState(state: Partial<Omit<StorageState, 'lastUpdated'>>): void {
    if (!this.storageAvailable) return;

    try {
      const currentState = this.loadState() || {};
      const newState = {
        ...currentState,
        ...state,
        lastUpdated: new Date().toISOString()
      };
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
    } catch (error) {
      console.error('Error saving state to localStorage:', error);
    }
  }

  public loadState(): Partial<StorageState> | null {
    if (!this.storageAvailable) return null;

    try {
      const storedState = localStorage.getItem(STORAGE_KEY);
      if (!storedState) return null;

      const parsedState = JSON.parse(storedState);
      
      // Convert stored date strings back to Date objects in uploadHistory
      if (parsedState.uploadHistory) {
        parsedState.uploadHistory = parsedState.uploadHistory.map((item: UploadHistoryItem) => ({
          ...item,
          timestamp: new Date(item.timestamp)
        }));
      }

      return parsedState;
    } catch (error) {
      console.error('Error loading state from localStorage:', error);
      return null;
    }
  }

  public clearState(): void {
    if (!this.storageAvailable) return;

    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing state from localStorage:', error);
    }
  }

  public isAvailable(): boolean {
    return this.storageAvailable;
  }

  public getLastUpdateTime(): Date | null {
    const state = this.loadState();
    if (!state || !state.lastUpdated) return null;
    return new Date(state.lastUpdated);
  }
}

export const storageManager = StorageManager.getInstance();