'use client';

import S from './LoadingSpinner.styl';

export function LoadingSpinner() {
  return (
    <div className={S.loadingSpinnerContainer}>
      <div className={S.loadingSpinner}></div>
    </div>
  );
}
