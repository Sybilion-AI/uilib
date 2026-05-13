import cn from 'classnames';

import { useTheme } from '#uilib/contexts/theme-context';
import {
  MoonIcon,
  SignOutIcon,
  SunIcon,
  UserCircleIcon,
} from '@phosphor-icons/react';
import { ChevronDownIcon } from 'lucide-react';

import { Avatar } from '../Avatar';
import { Button } from '../Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../DropdownMenu';
import { Image } from '../Image';
import S from './NavUserHeader.styl';
import type { NavUserHeaderProps } from './NavUserHeader.types';

export function NavUserHeader({
  variant = 'default',
  isLoading = false,
  isAuthenticated,
  user = null,
  menuItems,
  onLogout,
  signInSlot,
  onSignInClick,
  theme: themeFromHost,
  onThemeToggle: onThemeToggleFromHost,
}: NavUserHeaderProps) {
  const docsTheme = useTheme();
  const hostControlsTheme =
    themeFromHost !== undefined && onThemeToggleFromHost !== undefined;
  const theme = hostControlsTheme ? themeFromHost : docsTheme.theme;
  const toggleTheme = hostControlsTheme
    ? onThemeToggleFromHost
    : docsTheme.toggleTheme;
  const authenticated = isAuthenticated ?? true;

  const avatarUrl = user?.avatar ?? '';
  const userName = user?.name ?? '';
  const userEmail = user?.email ?? '';

  if (isLoading) {
    return (
      <Button variant="ghost" size="sm" disabled className={S.loadingButton}>
        <div className={S.avatarSkeleton} />
        <div className={S.textSkeleton} />
      </Button>
    );
  }

  if (!authenticated) {
    if (signInSlot) {
      return signInSlot;
    }
    return (
      <Button
        variant="ghost"
        size="sm"
        className={S.loginButton}
        type="button"
        onClick={onSignInClick}
      >
        <UserCircleIcon className={S.iconLg} />
        <span>Log in</span>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(S.userButton, variant === 'compact' && S.compact)}
        >
          <Avatar className={S.avatar}>
            <Image
              url={avatarUrl}
              alt={userName}
              fallback={<div className={S.avatarFallback} />}
            />
          </Avatar>
          {variant === 'default' && (
            <>
              <div className={S.userInfo}>
                <span className={`${S.userName} ph-no-capture`}>
                  {userName}
                </span>
                <span className={S.userEmail}>{userEmail}</span>
              </div>
              <ChevronDownIcon className={S.iconSm} />
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className={S.dropdownContent}
        align="end"
        elevation="md"
      >
        <DropdownMenuLabel className={S.userLabel}>
          <div className={S.userLabelContent}>
            <Avatar className={S.avatar}>
              <Image
                url={avatarUrl}
                alt={userName}
                fallback={<div className={S.avatarFallback} />}
              />
            </Avatar>
            <div className={S.userDetails}>
              <span className={`${S.userDetailName} ph-no-capture`}>
                {userName}
              </span>
              <span className={S.userDetailEmail}>{userEmail}</span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {menuItems}
          <DropdownMenuItem onSelect={toggleTheme}>
            {theme === 'dark' ? (
              <>
                <SunIcon />
                Light theme
              </>
            ) : (
              <>
                <MoonIcon />
                Dark theme
              </>
            )}
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onSelect={() => onLogout()}>
          <SignOutIcon />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
