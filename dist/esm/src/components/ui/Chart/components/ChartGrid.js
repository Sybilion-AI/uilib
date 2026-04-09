import { jsx } from 'react/jsx-runtime';
import { CartesianGrid } from 'recharts';
import S from '../Chart.styl.js';

function ChartGrid() {
    return jsx(CartesianGrid, { className: S.chartGrid, strokeWidth: 0.6 });
}

export { ChartGrid };
