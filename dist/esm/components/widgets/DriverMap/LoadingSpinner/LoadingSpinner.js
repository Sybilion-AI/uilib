import { jsx } from 'react/jsx-runtime';
import S from './LoadingSpinner.styl.js';

function LoadingSpinner() {
    return (jsx("div", { className: S.loadingSpinnerContainer, children: jsx("div", { className: S.loadingSpinner }) }));
}

export { LoadingSpinner };
