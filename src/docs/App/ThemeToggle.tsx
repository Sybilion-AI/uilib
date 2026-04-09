import { Button } from '#uilib/components/ui/Button';
import { useTheme } from '#uilib/docs/contexts/theme-context';
import { MoonIcon, SunIcon } from '@phosphor-icons/react';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const toggle = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      icon
      onClick={toggle}
      aria-label={
        theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'
      }
    >
      {theme === 'dark' ? (
        <SunIcon aria-hidden weight="bold" />
      ) : (
        <MoonIcon aria-hidden weight="bold" />
      )}
    </Button>
  );
}
