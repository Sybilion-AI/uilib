import { jsxs, jsx } from 'react/jsx-runtime';
import cn from 'classnames';
import { useState } from 'react';
import { CaretUpIcon, CaretDownIcon } from '@phosphor-icons/react';
import S from './Foldable.styl.js';

function Foldable({ header, content, contentClassName, defaultUnfolded = false, }) {
    const [isUnfolded, setIsUnfolded] = useState(defaultUnfolded);
    const toggleFold = () => {
        setIsUnfolded(prev => !prev);
    };
    return (jsxs("div", { className: cn(S.root, isUnfolded && S.unfolded), children: [jsxs("div", { className: S.header, onClick: toggleFold, children: [jsx("div", { className: S.headerContent, children: header }), jsx("div", { className: S.toggle, children: isUnfolded ? (jsx(CaretUpIcon, { size: 20, className: S.icon })) : (jsx(CaretDownIcon, { size: 20, className: S.icon })) })] }), isUnfolded && (jsx("div", { className: cn(S.content, contentClassName), children: content }))] }));
}

export { Foldable };
