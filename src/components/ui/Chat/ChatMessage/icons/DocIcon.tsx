import React from 'react';

import DocPng from './doc.png';

export function DocIcon({ size = 32 }: { size?: number }) {
  return <img src={DocPng} width={size} height={size} alt="DOC file" />;
}
