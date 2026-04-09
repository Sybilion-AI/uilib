import { createContext } from 'react';

export const PageContext = createContext<{
  isScrolled: boolean;
  setIsScrolled: (isScrolled: boolean) => void;
}>({
  isScrolled: false,
  setIsScrolled: () => {},
});
