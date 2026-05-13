import { Link } from 'react-router-dom';

import { Button } from '#uilib/components/ui/Button';

import S from './SybilionSignInPanel.styl';

export type SybilionSignInPanelProps = {
  onSignIn: () => void | Promise<void>;
  isSigningIn?: boolean;
  error?: string | null;
  forgotPasswordTo: string;
  releasesTo?: string;
  versionLabel?: string;
  primaryButtonLabel?: string;
  connectingLabel?: string;
};

export function SybilionSignInPanel({
  onSignIn,
  isSigningIn = false,
  error,
  forgotPasswordTo,
  releasesTo,
  versionLabel,
  primaryButtonLabel = 'Sign-in',
  connectingLabel = 'Connecting...',
}: SybilionSignInPanelProps) {
  const signingIn = Boolean(isSigningIn);

  return (
    <>
      <div className={S.socialButtonContainer}>
        <Button
          variant="outline"
          type="button"
          className={S.socialButton}
          onClick={() => void onSignIn()}
          disabled={signingIn}
        >
          {signingIn ? connectingLabel : primaryButtonLabel}
        </Button>
      </div>

      {error ? <div className={S.errorMessage}>{error}</div> : null}

      <div className={S.forgotPassword}>
        <Link to={forgotPasswordTo} className={S.forgotPasswordLink}>
          Forgot password?
        </Link>
      </div>

      {releasesTo && versionLabel ? (
        <Link className={S.version} to={releasesTo}>
          v{versionLabel}
        </Link>
      ) : null}
    </>
  );
}
