import { jsx } from 'react/jsx-runtime';
import S from './FlickeringGrid.styl.js';

const FlickeringGrid = ({ className, }) => {
    return jsx("div", { className: `${S.container} ${className}` });
};

export { FlickeringGrid };
