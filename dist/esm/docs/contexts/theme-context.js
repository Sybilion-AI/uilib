import 'react/jsx-runtime';
import { createContext, useContext } from 'react';
import '@homecode/ui';
import '../lib/theme.js';

const ThemeContext = createContext({
    theme: 'light',
    isDarkMode: false,
    setTheme: () => { },
    toggleTheme: () => { },
});
const useTheme = () => useContext(ThemeContext);

export { useTheme };
