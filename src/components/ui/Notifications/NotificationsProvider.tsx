import type { ReactNode } from 'react';

import { Notifications } from './Notifications';

export type NotificationsProviderProps = {
  children: ReactNode;
};

export function NotificationsProvider({
  children,
}: NotificationsProviderProps) {
  return (
    <>
      {children}
      <Notifications />
    </>
  );
}
