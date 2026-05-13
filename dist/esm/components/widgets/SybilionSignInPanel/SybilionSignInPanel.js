import { jsxs, Fragment, jsx } from 'react/jsx-runtime';
import { Link } from 'react-router-dom';
import { Button } from '../../ui/Button/Button.js';
import S from './SybilionSignInPanel.styl.js';

function SybilionSignInPanel({ onSignIn, isSigningIn = false, error, forgotPasswordTo, releasesTo, versionLabel, primaryButtonLabel = 'Sign-in', connectingLabel = 'Connecting...', }) {
    const signingIn = Boolean(isSigningIn);
    return (jsxs(Fragment, { children: [jsx("div", { className: S.socialButtonContainer, children: jsx(Button, { variant: "outline", type: "button", className: S.socialButton, onClick: () => void onSignIn(), disabled: signingIn, children: signingIn ? connectingLabel : primaryButtonLabel }) }), error ? jsx("div", { className: S.errorMessage, children: error }) : null, jsx("div", { className: S.forgotPassword, children: jsx(Link, { to: forgotPasswordTo, className: S.forgotPasswordLink, children: "Forgot password?" }) }), releasesTo && versionLabel ? (jsxs(Link, { className: S.version, to: releasesTo, children: ["v", versionLabel] })) : null] }));
}

export { SybilionSignInPanel };
