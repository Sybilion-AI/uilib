import type { RedirectLoginOptions } from '@auth0/auth0-react';
import { type SybilionAuthLayoutProps } from '#uilib/components/widgets/SybilionAuthLayout';
import { type SybilionSignInPanelProps } from '../SybilionSignInPanel';
export type SignInPageProps = Pick<SybilionAuthLayoutProps, 'logoSize' | 'containerClassName'> & Pick<SybilionSignInPanelProps, 'forgotPasswordTo' | 'releasesTo' | 'versionLabel' | 'primaryButtonLabel' | 'connectingLabel'> & {
    title?: string;
    subtitle?: string;
    /** Extra Auth0 `loginWithRedirect` options; merged with default sign-in params. */
    loginRedirectOptions?: RedirectLoginOptions;
};
export declare function SignInPage({ title, subtitle, forgotPasswordTo, releasesTo, versionLabel, primaryButtonLabel, connectingLabel, loginRedirectOptions, logoSize, containerClassName, }: SignInPageProps): import("react/jsx-runtime").JSX.Element;
