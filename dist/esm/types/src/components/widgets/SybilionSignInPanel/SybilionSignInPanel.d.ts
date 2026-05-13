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
export declare function SybilionSignInPanel({ onSignIn, isSigningIn, error, forgotPasswordTo, releasesTo, versionLabel, primaryButtonLabel, connectingLabel, }: SybilionSignInPanelProps): import("react/jsx-runtime").JSX.Element;
