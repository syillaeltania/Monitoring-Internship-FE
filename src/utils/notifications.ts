export type NotificationSeverity = 'info' | 'warning' | 'danger' | string | undefined;

export interface AppNotification {
  type?: string;
  title: string;
  description?: string;
  severity?: NotificationSeverity;
}

export const countNotifications = (items?: AppNotification[]) => items?.length ?? 0;

export const notificationSeverityLabel = (severity: NotificationSeverity) => {
  if (severity === 'danger') return 'Urgent';
  if (severity === 'warning') return 'Perhatian';
  return 'Info';
};

export const notificationSeverityClass = (severity: NotificationSeverity) => {
  if (severity === 'danger') return 'bg-red-50 text-red-700 ring-red-100';
  if (severity === 'warning') return 'bg-amber-50 text-amber-700 ring-amber-100';
  return 'bg-blue-50 text-blue-700 ring-blue-100';
};
