import { NotificationsStore } from '@homecode/ui';

import type {
  NotificationItemParams,
  UseNotificationsReturn,
} from './Notifications.types';

export function useNotifications(): UseNotificationsReturn {
  return {
    show: (data: NotificationItemParams) => NotificationsStore.show(data),
    close: (id: string) => NotificationsStore.close(id),
    remove: (id: string) => NotificationsStore.remove(id),
    pause: () => NotificationsStore.pause(),
    unpause: () => NotificationsStore.unpause(),
  };
}
