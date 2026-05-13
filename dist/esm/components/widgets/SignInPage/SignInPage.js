import { jsx } from 'react/jsx-runtime';
import { SybilionAuthLayout } from '../SybilionAuthLayout/SybilionAuthLayout.js';
import '../SybilionAuthLayout/SybilionAuthHeadline.styl.js';
import { useSybilionAuth } from '../../../sybilion-auth/SybilionAuthProvider.js';
import { SybilionSignInPanel } from '../SybilionSignInPanel/SybilionSignInPanel.js';

const DEFAULT_TITLE = 'Sign In';
const DEFAULT_SUBTITLE = 'To get access authenticate through google or your email.';
function SignInPage({ title = DEFAULT_TITLE, subtitle = DEFAULT_SUBTITLE, forgotPasswordTo = '/forgot-password', releasesTo = '/releases', versionLabel, primaryButtonLabel, connectingLabel, loginRedirectOptions, logoSize, containerClassName, }) {
    const { error, loginWithRedirect, isLoading, isAuthenticated } = useSybilionAuth();
    const handleSignIn = () => loginWithRedirect({
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
    return (jsx(SybilionAuthLayout, { title: title, subtitle: subtitle, logoSize: logoSize, containerClassName: containerClassName, children: jsx(SybilionSignInPanel, { onSignIn: handleSignIn, isSigningIn: isLoading && !isAuthenticated, error: error, forgotPasswordTo: forgotPasswordTo, releasesTo: releasesTo, versionLabel: versionLabel, primaryButtonLabel: primaryButtonLabel, connectingLabel: connectingLabel }) }));
}

export { SignInPage };
