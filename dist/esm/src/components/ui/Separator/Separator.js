import { jsx } from 'react/jsx-runtime';
import cn from 'classnames';
import * as SeparatorPrimitive from '@radix-ui/react-separator';
import S from './Separator.styl.js';

function Separator({ className, orientation = 'horizontal', decorative = true, ...props }) {
    return (jsx(SeparatorPrimitive.Root, { "data-slot": "separator", decorative: decorative, orientation: orientation, className: cn(S.root, className), ...props }));
}

export { Separator };
