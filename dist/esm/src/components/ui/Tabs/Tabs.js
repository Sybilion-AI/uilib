import { jsx } from 'react/jsx-runtime';
import cn from 'classnames';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import S from './Tabs.styl.js';

function Tabs({ className, variant = 'button', darker = false, ...props }) {
    return (jsx(TabsPrimitive.Root, { "data-slot": "tabs", className: cn(S.root, S[`variant-${variant}`], darker && S.darker, className), ...props }));
}
function TabsList({ className, fullWidth, darker, ...props }) {
    return (jsx(TabsPrimitive.List, { "data-slot": "tabs-list", className: cn(S.list, fullWidth && S.fullWidth, darker && S.darker, className), ...props }));
}
function TabsTrigger({ className, ...props }) {
    return (jsx(TabsPrimitive.Trigger, { "data-slot": "tabs-trigger", className: cn(S.trigger, className), ...props }));
}
function TabsContent({ className, ...props }) {
    return (jsx(TabsPrimitive.Content, { "data-slot": "tabs-content", className: cn(S.content, className), ...props }));
}

export { Tabs, TabsContent, TabsList, TabsTrigger };
