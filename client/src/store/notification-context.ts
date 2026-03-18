import { createContext } from 'react';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface NotificationPayload {
  title?: string;
  message: string;
  type?: NotificationType;
  durationMs?: number;
}

export interface NotificationContextValue {
  notify: (payload: NotificationPayload) => string;
  success: (message: string, title?: string) => string;
  error: (message: string, title?: string) => string;
  warning: (message: string, title?: string) => string;
  info: (message: string, title?: string) => string;
  dismiss: (id: string) => void;
  clear: () => void;
}

export const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);
