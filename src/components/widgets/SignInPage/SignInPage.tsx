import type { RedirectLoginOptions } from '@auth0/auth0-react';

import {
  SybilionAuthLayout,
  type SybilionAuthLayoutProps,
} from '#uilib/components/widgets/SybilionAuthLayout';
import { useSybilionAuth } from '#uilib/sybilion-auth/SybilionAuthProvider';

import {
  SybilionSignInPanel,
  type SybilionSignInPanelProps,
} from '../SybilionSignInPanel';

export type SignInPageProps = Pick<
  SybilionAuthLayoutProps,
  'logoSize' | 'containerClassName'
> &
  Pick<
    SybilionSignInPanelProps,
    | 'forgotPasswordTo'
    | 'releasesTo'
    | 'versionLabel'
    | 'primaryButtonLabel'
    | 'connectingLabel'
  > & {
    title?: string;
    subtitle?: string;
    /** Extra Auth0 `loginWithRedirect` options; merged with default sign-in params. */
    loginRedirectOptions?: RedirectLoginOptions;
  };

const DEFAULT_TITLE = 'Sign In';
const DEFAULT_SUBTITLE =
  'To get access authenticate through google or your email.';

export function SignInPage({
  title = DEFAULT_TITLE,
  subtitle = DEFAULT_SUBTITLE,
  forgotPasswordTo = '/forgot-password',
  releasesTo = '/releases',
  versionLabel,
  primaryButtonLabel,
  connectingLabel,
  loginRedirectOptions,
  logoSize,
  containerClassName,
}: SignInPageProps) {
  const { error, loginWithRedirect, isLoading } = useSybilionAuth();

  const handleSignIn = () =>
    loginWithRedirect({
      ...loginRedirectOptions,
      authorizationParams: {
        prompt: 'login',
        screen_hint: 'login',
        ...(typeof window !== 'undefined'
          ? { origin: window.location.origin }
          : {}),
        ...loginRedirectOptions?.authorizationParams,
      },
    });

  return (
    <SybilionAuthLayout
      title={title}
      subtitle={subtitle}
      logoSize={logoSize}
      containerClassName={containerClassName}
    >
      <SybilionSignInPanel
        onSignIn={handleSignIn}
        isSigningIn={isLoading}
        error={error}
        forgotPasswordTo={forgotPasswordTo}
        releasesTo={releasesTo}
        versionLabel={versionLabel}
        primaryButtonLabel={primaryButtonLabel}
        connectingLabel={connectingLabel}
      />
    </SybilionAuthLayout>
  );
}
