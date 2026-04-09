import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/Tooltip';
import { QuestionIcon } from '@phosphor-icons/react';

import S from './InfoIconTooltip.styl';

export function InfoIconTooltip({ children }: { children: React.ReactNode }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span>
          <QuestionIcon size={16} className={S.infoIcon} />
        </span>
      </TooltipTrigger>
      <TooltipContent maxWidth={300}>{children}</TooltipContent>
    </Tooltip>
  );
}
