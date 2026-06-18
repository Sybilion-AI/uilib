SybilionAuthLayout provides the split-view chrome for authentication routes: a branded hero column beside a form column with a title and subtitle. Place a form such as SybilionSignInPanel as its child; on a real route it fills the full viewport.

## When to use

- For full-page authentication flows, such as sign-in, sign-up, or password reset.
- When a standalone app needs consistent Sybilion branding on its auth screens.

## When not to use

- For authenticated pages inside the app shell; use PageHeader and PageContent instead.
- For inline or modal sign-in prompts that should not take over the whole viewport.

## Do

- In standalone apps, copy the package logo to public/logo.svg so the hero column renders the correct branding.
