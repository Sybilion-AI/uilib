import { CartesianGrid } from 'recharts';

import S from '../Chart.styl';

export function ChartGrid() {
  return <CartesianGrid className={S.chartGrid} strokeWidth={0.6} />;
}
