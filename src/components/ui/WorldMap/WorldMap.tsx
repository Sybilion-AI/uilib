import cn from 'classnames';

import S from './WorldMap.styl';
import mapBgUrl from './map.svg';

export type WorldMapProps = {
  className?: string;
};

export function WorldMap({ className }: WorldMapProps) {
  const src = mapBgUrl as unknown as string;

  return (
    <img
      alt=""
      className={cn(S.worldMap, className)}
      decoding="async"
      draggable={false}
      src={src}
    />
  );
}
