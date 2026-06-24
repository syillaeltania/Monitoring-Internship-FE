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
  if (severity === 'danger') return 'bg-[#FFE8E2] text-[#C64632] ring-[#FFB3A4]';
  if (severity === 'warning') return 'bg-[#FFF5C8] text-[#8A6A00] ring-[#F7D95D]';
  return 'bg-[#EEF2FF] text-[#3158E8] ring-[#3158E8]/20';
};
