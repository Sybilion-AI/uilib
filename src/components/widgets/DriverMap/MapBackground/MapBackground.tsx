'use client';

import S from './MapBackground.styl';
import mapBgUrl from './map.svg';

export function MapBackground() {
  const src = mapBgUrl as unknown as string;

  return (
    <img
      alt=""
      className={S.mapBackground}
      decoding="async"
      draggable={false}
      src={src}
    />
  );
}
