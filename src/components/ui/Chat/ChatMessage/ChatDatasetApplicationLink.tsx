import { Link, useSearchParams } from 'react-router-dom';
import { LayoutDashboard } from 'lucide-react';

import { buildDatasetApplicationPath } from '@/utils/datasetApplicationLink';

import S from './ChatMessage.styl';

export function ChatDatasetApplicationLink({
  datasetId,
  analysisId,
  label = 'Open application',
}: {
  datasetId: number;
  analysisId?: number;
  label?: string;
}) {
  const url = buildDatasetApplicationPath(datasetId, analysisId);
  const [searchParams, setSearchParams] = useSearchParams();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (location.pathname !== '/datasets') return;

    e.preventDefault();
    const params = new URLSearchParams(searchParams);

    params.set('id', datasetId.toString());
    if (analysisId) params.set('analysisId', analysisId.toString());

    setSearchParams(params);
  };

  return (
    <Link className={S.datasetAppLink} to={url} onClickCapture={handleClick}>
      <LayoutDashboard size={16} aria-hidden />
      <span className={S.datasetAppLinkLabel}>{label}</span>
    </Link>
  );
}
