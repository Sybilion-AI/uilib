import { jsx } from 'react/jsx-runtime';
import cn from 'classnames';
import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { PageContext } from '../pageContext.js';
import { Scroll } from '@homecode/ui';
import S from './PageScroll.styl.js';

function PageScrollInner({ className, children, }) {
    // const { setIsScrolled } = useContext(PageContext);
    // const prevScrollTop = useRef(0);
    const location = useLocation();
    const scrollInnerRef = useRef(null);
    useEffect(() => {
        scrollInnerRef.current?.scrollTo({ top: 0 });
    }, [location.pathname]);
    // const onScroll = (e: React.UIEvent<HTMLDivElement>) => {
    //   if (e.currentTarget.scrollTop > prevScrollTop.current) {
    //     // if (e.currentTarget.scrollTop > 0) {
    //     setIsScrolled(true);
    //   } else {
    //     setIsScrolled(false);
    //   }
    //   prevScrollTop.current = e.currentTarget.scrollTop;
    // };
    return (jsx(Scroll, { y: true, 
        // fadeSize="l"
        offset: { y: { before: 120, after: 130 } }, className: S.root, autoHide: true, innerClassName: cn(S.inner, className), yScrollbarClassName: S.scrollbar, onInnerRef: el => {
            scrollInnerRef.current = el;
        }, children: children }));
}
const PageScroll = ({ children, className, }) => {
    const [isScrolled, setIsScrolled] = useState(false);
    return (jsx(PageContext.Provider, { value: { isScrolled, setIsScrolled }, children: jsx(PageScrollInner, { className: className, children: children }) }));
};

export { PageScroll };
