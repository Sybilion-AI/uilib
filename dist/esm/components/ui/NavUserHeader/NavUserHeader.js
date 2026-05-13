import { jsxs, jsx, Fragment } from 'react/jsx-runtime';
import cn from 'classnames';
import { useTheme } from '../../../contexts/theme-context.js';
import { UserCircleIcon, SunIcon, MoonIcon, SignOutIcon } from '@phosphor-icons/react';
import { ChevronDownIcon } from 'lucide-react';
import { Avatar } from '../Avatar/Avatar.js';
import { Button } from '../Button/Button.js';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuGroup, DropdownMenuItem } from '../DropdownMenu/DropdownMenu.js';
import { Image } from '../Image/Image.js';
import S from './NavUserHeader.styl.js';

function NavUserHeader({ variant = 'default', isLoading = false, isAuthenticated, user = null, menuItems, onLogout, signInSlot, onSignInClick, theme: themeFromHost, onThemeToggle: onThemeToggleFromHost, }) {
    const docsTheme = useTheme();
    const hostControlsTheme = themeFromHost !== undefined && onThemeToggleFromHost !== undefined;
    const theme = hostControlsTheme ? themeFromHost : docsTheme.theme;
    const toggleTheme = hostControlsTheme
        ? onThemeToggleFromHost
        : docsTheme.toggleTheme;
    const authenticated = isAuthenticated ?? true;
    const avatarUrl = user?.avatar ?? '';
    const userName = user?.name ?? '';
    const userEmail = user?.email ?? '';
    if (isLoading) {
        return (jsxs(Button, { variant: "ghost", size: "sm", disabled: true, className: S.loadingButton, children: [jsx("div", { className: S.avatarSkeleton }), jsx("div", { className: S.textSkeleton })] }));
    }
    if (!authenticated) {
        if (signInSlot) {
            return signInSlot;
        }
        return (jsxs(Button, { variant: "ghost", size: "sm", className: S.loginButton, type: "button", onClick: onSignInClick, children: [jsx(UserCircleIcon, { className: S.iconLg }), jsx("span", { children: "Log in" })] }));
    }
    return (jsxs(DropdownMenu, { children: [jsx(DropdownMenuTrigger, { asChild: true, children: jsxs(Button, { variant: "ghost", size: "sm", className: cn(S.userButton, variant === 'compact' && S.compact), children: [jsx(Avatar, { className: S.avatar, children: jsx(Image, { url: avatarUrl, alt: userName, fallback: jsx("div", { className: S.avatarFallback }) }) }), variant === 'default' && (jsxs(Fragment, { children: [jsxs("div", { className: S.userInfo, children: [jsx("span", { className: `${S.userName} ph-no-capture`, children: userName }), jsx("span", { className: S.userEmail, children: userEmail })] }), jsx(ChevronDownIcon, { className: S.iconSm })] }))] }) }), jsxs(DropdownMenuContent, { className: S.dropdownContent, align: "end", elevation: "md", children: [jsx(DropdownMenuLabel, { className: S.userLabel, children: jsxs("div", { className: S.userLabelContent, children: [jsx(Avatar, { className: S.avatar, children: jsx(Image, { url: avatarUrl, alt: userName, fallback: jsx("div", { className: S.avatarFallback }) }) }), jsxs("div", { className: S.userDetails, children: [jsx("span", { className: `${S.userDetailName} ph-no-capture`, children: userName }), jsx("span", { className: S.userDetailEmail, children: userEmail })] })] }) }), jsx(DropdownMenuSeparator, {}), jsxs(DropdownMenuGroup, { children: [menuItems, jsx(DropdownMenuItem, { onSelect: toggleTheme, children: theme === 'dark' ? (jsxs(Fragment, { children: [jsx(SunIcon, {}), "Light theme"] })) : (jsxs(Fragment, { children: [jsx(MoonIcon, {}), "Dark theme"] })) })] }), jsx(DropdownMenuSeparator, {}), jsxs(DropdownMenuItem, { variant: "destructive", onSelect: () => onLogout(), children: [jsx(SignOutIcon, {}), "Log out"] })] })] }));
}

export { NavUserHeader };
