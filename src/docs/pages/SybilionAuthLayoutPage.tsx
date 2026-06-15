import { PageContentSection } from '#uilib/components/ui/Page';
import { SybilionAuthLayout } from '#uilib/components/widgets/SybilionAuthLayout';
import { SybilionSignInPanel } from '#uilib/components/widgets/SybilionSignInPanel';

import { AppPageHeader } from '../components/AppPageHeader/AppPageHeader';
import { DocsGuidance } from '../components/DocsGuidance/DocsGuidance';
import { DocsHeaderActions } from '../docsHeaderActions';

export default function SybilionAuthLayoutPage() {
  return (
    <>
      <AppPageHeader
        breadcrumbs={[{ label: 'SybilionAuthLayout' }]}
        title="SybilionAuthLayout"
        subheader="Split-view auth chrome (hero column + form). Standalone apps: copy package logo to public/logo.svg — see Logo."
        actions={<DocsHeaderActions />}
      />
      <DocsGuidance
        overview="SybilionAuthLayout provides the split-view chrome for authentication routes: a branded hero column beside a form column with a title and subtitle. Place a form such as SybilionSignInPanel as its child; on a real route it fills the full viewport."
        whenToUse={[
          'For full-page authentication flows, such as sign-in, sign-up, or password reset.',
          'When a standalone app needs consistent Sybilion branding on its auth screens.',
        ]}
        whenNotToUse={[
          'For authenticated pages inside the app shell; use PageHeader and PageContent instead.',
          'For inline or modal sign-in prompts that should not take over the whole viewport.',
        ]}
        doNotes={[
          'In standalone apps, copy the package logo to public/logo.svg so the hero column renders the correct branding.',
        ]}
      />
      <PageContentSection title="Preview">
        <p style={{ marginTop: 0, color: 'var(--muted-foreground)' }}>
          Clipped height so <code>100vh</code> layout fits the docs shell. Real
          sign-in route uses full viewport — e.g. <code>SignInPage</code> (wraps
          this layout + <code>SybilionSignInPanel</code>).
        </p>
        <div
          style={{
            overflow: 'hidden',
            borderRadius: 34,
            border: '2px dashed var(--border)',
            height: 'min(720px, 85vh)',
          }}
        >
          <SybilionAuthLayout
            title="Sign In"
            subtitle="Example — authenticate to continue."
            style={{ height: '100%' }}
          >
            <SybilionSignInPanel
              onSignIn={() => undefined}
              forgotPasswordTo="/forgot-password"
              releasesTo="/releases"
              versionLabel="0.0.1"
            />
          </SybilionAuthLayout>
        </div>
      </PageContentSection>
    </>
  );
}
