import { jsx } from 'react/jsx-runtime';
import cn from 'classnames';
import S from './PageColumns.styl.js';

function PageColumns({ columns, fill = 'all', className, }) {
    return (jsx("div", { className: cn(S.root, fill === 'left' && S.fillLeft, fill === 'right' && S.fillRight, fill === 'all' && S.fillAll, className), children: columns.map((column, index) => (jsx("div", { className: cn(S.column), children: column }, index))) }));
}

export { PageColumns };
