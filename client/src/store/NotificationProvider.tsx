import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  NotificationContext,
  type NotificationContextValue,
  type NotificationPayload,
  type NotificationType,
} from './notification-context';

interface NotificationProviderProps {
  children: ReactNode;
}

interface NotificationItem {
  id: string;
  title?: string;
  message: string;
  type: NotificationType;
}

const TYPE_META: Record<
  NotificationType,
  {
    icon: string;
    iconWrapperClass: string;
    borderClass: string;
    titleClass: string;
  }
> = {
  success: {
    icon: 'fas fa-check',
    iconWrapperClass: 'bg-emerald-100 text-emerald-700',
    borderClass: 'border-emerald-200',
    titleClass: 'text-emerald-700',
  },
  error: {
    icon: 'fas fa-circle-xmark',
    iconWrapperClass: 'bg-red-100 text-red-700',
    borderClass: 'border-red-200',
    titleClass: 'text-red-700',
  },
  warning: {
    icon: 'fas fa-triangle-exclamation',
    iconWrapperClass: 'bg-amber-100 text-amber-700',
    borderClass: 'border-amber-200',
    titleClass: 'text-amber-700',
  },
  info: {
    icon: 'fas fa-circle-info',
    iconWrapperClass: 'bg-green-100 text-green-700',
    borderClass: 'border-green-200',
    titleClass: 'text-green-700',
  },
};

const createNotificationId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
};

export const NotificationProvider = ({ children }: NotificationProviderProps) => {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const timersRef = useRef<Map<string, number>>(new Map());

  const dismiss = useCallback((id: string) => {
    const timerId = timersRef.current.get(id);
    if (timerId) {
      window.clearTimeout(timerId);
      timersRef.current.delete(id);
    }
    setItems((current) => current.filter((item) => item.id !== id));
  }, []);

  const notify = useCallback(
    (payload: NotificationPayload) => {
      const id = createNotificationId();
      const type = payload.type ?? 'info';
      const nextItem: NotificationItem = {
        id,
        title: payload.title,
        message: payload.message,
        type,
      };

      setItems((current) => [...current.slice(-3), nextItem]);

      const timeoutMs = payload.durationMs ?? 4200;
      const timeoutId = window.setTimeout(() => {
        dismiss(id);
      }, timeoutMs);
      timersRef.current.set(id, timeoutId);
      return id;
    },
    [dismiss],
  );

  const clear = useCallback(() => {
    timersRef.current.forEach((timerId) => window.clearTimeout(timerId));
    timersRef.current.clear();
    setItems([]);
  }, []);

  const value = useMemo<NotificationContextValue>(
    () => ({
      notify,
      success: (message, title) => notify({ message, title, type: 'success' }),
      error: (message, title) => notify({ message, title, type: 'error' }),
      warning: (message, title) => notify({ message, title, type: 'warning' }),
      info: (message, title) => notify({ message, title, type: 'info' }),
      dismiss,
      clear,
    }),
    [clear, dismiss, notify],
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}

      <div className="pointer-events-none fixed inset-x-4 top-20 z-[100] flex flex-col gap-3 sm:left-auto sm:right-6 sm:w-[380px]">
        {items.map((item) => {
          const meta = TYPE_META[item.type];

          return (
            <div
              key={item.id}
              className={`pointer-events-auto rounded-xl border ${meta.borderClass} bg-white/95 shadow-xl shadow-black/5 backdrop-blur-sm animate-[toastIn_220ms_ease-out]`}
              role="status"
              aria-live="polite"
            >
              <div className="flex items-start gap-3 p-4">
                <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${meta.iconWrapperClass}`}>
                  <i className={`${meta.icon} text-sm`} />
                </div>

                <div className="min-w-0 flex-1">
                  {item.title ? <p className={`text-sm font-semibold ${meta.titleClass}`}>{item.title}</p> : null}
                  <p className="text-sm leading-5 text-slate-700">{item.message}</p>
                </div>

                <button
                  type="button"
                  className="rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                  onClick={() => dismiss(item.id)}
                  aria-label="Close notification"
                >
                  <i className="fas fa-times text-xs" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </NotificationContext.Provider>
  );
};
