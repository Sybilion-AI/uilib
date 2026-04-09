import cn from 'classnames';
import { useRef, useState } from 'react';

import useClickOutside from '@/hooks/useClickOutside';
import { SettingsIcon } from 'lucide-react';

import { Button } from '../../Button';
import { ChatSelector } from './ChatSelector';
import S from './ChatSettings.styl';

const NO_DATASET_ID = '0';

export interface ChatSettingsProps {
  /** Dataset id for chat sessions; required when not using app dataset context. */
  id?: string | null;
}

export function ChatSettings({ id }: ChatSettingsProps = {}) {
  const [showSettings, setShowSettings] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);
  const effectiveDatasetId = id ?? NO_DATASET_ID;

  // const { endpoint, setEndpoint } = useChats();

  useClickOutside({
    elem: settingsRef,
    callback: () => setShowSettings(false),
  });

  // const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
  //   if (e.key === 'Enter') {
  //     setShowSettings(false);
  //   }
  // };

  return (
    <div ref={settingsRef} className={cn(S.root, showSettings && S.isOpen)}>
      {showSettings && (
        <div className={S.content}>
          <ChatSelector id={effectiveDatasetId} />

          {/* <Input
            size="sm"
            placeholder="Endpoint URL"
            defaultValue={endpoint}
            onChange={e => setEndpoint(e.target.value)}
            onKeyDown={handleInputKeyDown}
          /> */}
        </div>
      )}
      <Button
        className={S.toggler}
        size="sm"
        variant="link"
        onClick={() => setShowSettings(!showSettings)}
      >
        <SettingsIcon size={16} />
      </Button>
    </div>
  );
}
