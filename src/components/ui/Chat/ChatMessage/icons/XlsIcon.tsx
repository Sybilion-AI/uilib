import React from 'react';

import XlsPng from './xls.png';

export function XlsIcon({ size = 32 }: { size?: number }) {
  return <img src={XlsPng} width={size} height={size} alt="XLS file" />;
}
