// src/components/data-entry/hooks/useNotification.ts
import { useContext } from 'react';
import { NotificationContext } from '../NotificationSystem';

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};