import cn from 'classnames';
import { createElement } from 'react';

import { Scroll } from '@homecode/ui';
import { useStore } from 'justorm/react';

import { NotificationItem } from './NotificationItem';
import S from './Notifications.styl';

export function Notifications() {
  const { notifications } = useStore({
    notifications: ['items', 'data'],
  });

  const { items, data, pause, unpause, close } = notifications;
  const api = { pause, unpause, close };

  return (
    <Scroll
      y
      size="s"
      // fadeSize="m"
      className={cn(S.root, items.length === 0 && S.empty)}
      innerClassName={S.inner}
      yScrollbarClassName={S.scrollbar}
      offset={{ y: { before: 14, after: 14 } }}
    >
      {items.map((id: string) =>
        createElement(NotificationItem, {
          ...data[id],
          ...api,
          id,
          key: id,
        }),
      )}
    </Scroll>
  );
}
