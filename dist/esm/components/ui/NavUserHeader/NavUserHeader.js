import { jsxs, jsx, Fragment } from 'react/jsx-runtime';
import cn from 'classnames';
import { useMemo } from 'react';
import { useTheme } from '../../../contexts/theme-context.js';
import { useIsMobile } from '../../../hooks/useIsMobile.js';
import { UserCircleIcon, SunIcon, MoonIcon, SignOutIcon } from '@phosphor-icons/react';
import { ChevronDownIcon } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '../Avatar/Avatar.js';
import { Button } from '../Button/Button.js';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuGroup, DropdownMenuItem } from '../DropdownMenu/DropdownMenu.js';
import S from './NavUserHeader.styl.js';

function NavUserHeader({ variant, isLoading = false, isAuthenticated, user = null, menuItems, onLogout, signInSlot, onSignInClick, theme: themeFromHost, onThemeToggle: onThemeToggleFromHost, }) {
    const docsTheme = useTheme();
    const isMobile = useIsMobile();
    const effectiveVariant = variant ?? (isMobile ? 'compact' : 'default');
    const hostControlsTheme = themeFromHost !== undefined && onThemeToggleFromHost !== undefined;
    const theme = hostControlsTheme ? themeFromHost : docsTheme.theme;
    const toggleTheme = hostControlsTheme
        ? onThemeToggleFromHost
        : docsTheme.toggleTheme;
    const authenticated = isAuthenticated ?? true;
    const avatarUrl = user?.avatar ?? '';
    const userName = user?.name ?? '';
    const userEmail = user?.email ?? '';
    const avatar = useMemo(() => {
        const initials = userName
            .split(' ')
            .map(name => name.charAt(0))
            .join('');
        return (jsxs(Avatar, { className: S.avatar, children: [jsx(AvatarImage, { src: avatarUrl || undefined, alt: userName }), jsx(AvatarFallback, { children: initials })] }));
    }, [avatarUrl, userName]);
    const userIdentity = useMemo(() => (jsxs("div", { className: S.userInfo, children: [jsx("span", { className: `${S.userName} ph-no-capture`, children: userName }), jsx("span", { className: S.userEmail, children: userEmail })] })), [userEmail, userName]);
    if (isLoading) {
        return (jsxs(Button, { variant: "ghost", size: "sm", disabled: true, className: S.loadingButton, children: [jsx("div", { className: S.avatarSkeleton }), jsx("div", { className: S.textSkeleton })] }));
    }
    if (!authenticated) {
        if (signInSlot) {
            return signInSlot;
        }
        return (jsxs(Button, { variant: "ghost", size: "sm", className: S.loginButton, type: "button", onClick: onSignInClick, children: [jsx(UserCircleIcon, { className: S.iconLg }), jsx("span", { children: "Log in" })] }));
    }
    return (jsxs(DropdownMenu, { children: [jsx(DropdownMenuTrigger, { asChild: true, children: jsxs(Button, { variant: "ghost", size: "sm", className: cn(S.userButton, effectiveVariant === 'compact' && S.compact), children: [avatar, effectiveVariant === 'default' && (jsxs(Fragment, { children: [userIdentity, jsx(ChevronDownIcon, { className: S.iconSm })] }))] }) }), jsxs(DropdownMenuContent, { className: S.dropdownContent, align: "end", elevation: "md", children: [jsx(DropdownMenuLabel, { className: S.userLabel, children: jsxs("div", { className: S.userLabelContent, children: [avatar, userIdentity] }) }), jsx(DropdownMenuSeparator, {}), jsxs(DropdownMenuGroup, { children: [menuItems, jsx(DropdownMenuItem, { onSelect: toggleTheme, children: theme === 'dark' ? (jsxs(Fragment, { children: [jsx(SunIcon, {}), "Light theme"] })) : (jsxs(Fragment, { children: [jsx(MoonIcon, {}), "Dark theme"] })) })] }), jsx(DropdownMenuSeparator, {}), jsxs(DropdownMenuItem, { variant: "destructive", onSelect: () => onLogout(), children: [jsx(SignOutIcon, {}), "Log out"] })] })] }));
}

export { NavUserHeader };
