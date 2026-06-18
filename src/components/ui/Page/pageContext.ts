import { createContext } from 'react';

export const PageContext = createContext<{
  isScrolled: boolean;
  setIsScrolled: (isScrolled: boolean) => void;
  getPageScrollElement: () => HTMLDivElement | null;
}>({
  isScrolled: false,
  setIsScrolled: () => {},
  getPageScrollElement: () => null,
});
