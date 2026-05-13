import { PageContentSection } from '#uilib/components/ui/Page';
import { SybilionAuthLayout } from '#uilib/components/widgets/SybilionAuthLayout';
import { SybilionSignInPanel } from '#uilib/components/widgets/SybilionSignInPanel';

import { AppPageHeader } from '../components/AppPageHeader/AppPageHeader';
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
