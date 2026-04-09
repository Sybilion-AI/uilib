import { createContext } from 'react';

const PageContext = createContext({
    isScrolled: false,
    setIsScrolled: () => { },
});

export { PageContext };
