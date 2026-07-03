import type { ReactNode } from 'react';

export type NotificationType = 'warning' | 'danger' | 'loading';

export type NotificationItemParams = {
  type?: NotificationType;
  title?: string;
  content?: ReactNode;
  autoHide?: boolean;
};

export type UseNotificationsReturn = {
  show: (data: NotificationItemParams) => string;
  close: (id: string) => void;
  remove: (id: string) => void;
  pause: () => void;
  unpause: () => void;
};

export type NotificationItemProps = NotificationItemParams & {
  id: string;
  visible?: boolean;
  content?: ReactNode | (() => ReactNode);
  close: (id: string) => void;
  pause: () => void;
  unpause: () => void;
};
