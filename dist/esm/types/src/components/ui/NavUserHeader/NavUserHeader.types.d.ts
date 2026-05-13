import type { ReactNode } from 'react';
export type NavUserHeaderUser = {
    name: string;
    email: string;
    /** Passed to avatar `Image` as `src`. */
    avatar?: string;
};
export type NavUserHeaderProps = {
    variant?: 'default' | 'compact';
    isLoading?: boolean;
    /** When false, signed-out branch is shown. Defaults to true when omitted. */
    isAuthenticated?: boolean;
    /** Present when authenticated: shown in trigger and dropdown label. */
    user?: NavUserHeaderUser | null;
    /** Rows inside the menu above theme toggle and logout. Use `DropdownMenuItem` nodes. */
    menuItems?: ReactNode;
    onLogout: () => void;
    /** Replaces default “Log in” control when signed out. */
    signInSlot?: ReactNode;
    onSignInClick?: () => void;
    /** When both are set, theme row uses these instead of uilib `ThemeProvider` context. */
    theme?: 'light' | 'dark';
    onThemeToggle?: () => void;
};
