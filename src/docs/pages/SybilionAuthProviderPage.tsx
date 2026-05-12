import { PageContentSection } from '#uilib/components/ui/Page';

import { AppPageHeader } from '../components/AppPageHeader/AppPageHeader';
import { DocsHeaderActions } from '../docsHeaderActions';

export default function SybilionAuthProviderPage() {
  return (
    <>
      <AppPageHeader
        breadcrumbs={[{ label: 'SybilionAuthProvider' }]}
        title="SybilionAuthProvider"
        subheader="Auth0 SPA → sdk.auth.loginWithAuth0Identity → Sybilion JWT. Pass createSybilionSDK instance via sdk prop; greenfield: docs/standalone-apps.md (yarn add includes @sybilion/sdk, @auth0/auth0-react)."
        actions={<DocsHeaderActions />}
      />
      <PageContentSection title="Exports">
        <p style={{ marginTop: 0 }}>
          From <code>@sybilion/uilib</code>:
        </p>
        <ul>
          <li>
            <code>SybilionAuthProvider</code> (<code>sdk</code> prop)
          </li>
          <li>
            <code>getSybilionApiOriginFromSdk</code>
          </li>
          <li>
            <code>useSybilionAuth</code>
          </li>
          <li>
            <code>useSybilionApiFetch</code>,{' '}
            <code>createSybilionApiFetch</code>, <code>sybilionApiFetch</code>
          </li>
          <li>
            <code>exchangeAuth0AccessTokenForSybilionJwt</code> (advanced)
          </li>
        </ul>
      </PageContentSection>
    </>
  );
}
