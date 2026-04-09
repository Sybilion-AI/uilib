import React from 'react';

import S from './FlickeringGrid.styl';
import type { FlickeringGridProps } from './FlickeringGrid.types';

export const FlickeringGrid: React.FC<FlickeringGridProps> = ({
  className,
}) => {
  return <div className={`${S.container} ${className}`} />;
};
