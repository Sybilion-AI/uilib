import { useState } from 'react';

import { Label } from '#uilib/components/ui/Label';
import {
  PageContent,
  PageContentSection,
  PageFooter,
} from '#uilib/components/ui/Page';
import type { PageFooterLinkItem } from '#uilib/components/ui/Page/PageFooter/PageFooter';
import { Switch } from '#uilib/components/ui/Switch';
import { GlobeIcon, Hash, MailIcon, MessageCircle } from 'lucide-react';

import { AppPageHeader } from '../components/AppPageHeader/AppPageHeader';
import { DocsGuidance } from '../components/DocsGuidance/DocsGuidance';
import { DocsHeaderActions } from '../docsHeaderActions';
import S from './PageFooterPage.styl';

const DEMO_LINKS: PageFooterLinkItem[] = [
  {
    id: 'site',
    label: (
      <>
        <GlobeIcon aria-hidden />
        Website
      </>
    ),
    url: 'https://sybilion.com',
  },
  {
    id: 'email',
    label: (
      <>
        <MailIcon aria-hidden />
        Email
      </>
    ),
    url: 'mailto:support@sybilion.com',
  },
  {
    id: 'discord',
    label: (
      <>
        <MessageCircle aria-hidden />
        Discord
      </>
    ),
    url: 'https://discord.com',
  },
  {
    id: 'slack',
    label: (
      <>
        <Hash aria-hidden />
        Slack
      </>
    ),
    url: 'https://slack.com',
  },
];

export default function PageFooterPage() {
  const [isMobile, setIsMobile] = useState(false);

  return (
    <>
      <AppPageHeader
        breadcrumbs={[{ label: 'PageFooter' }]}
        title="PageFooter"
        subheader="Copyright + optional link row with gap and wrapping."
        actions={<DocsHeaderActions />}
      />
      <DocsGuidance
        overview="PageFooter renders the page-level footer with copyright, a version label, and an optional row of links that wrap on narrow viewports. Links accept an icon and label and open external destinations."
        whenToUse={[
          'At the bottom of an application shell to show copyright, version, and support links.',
          'When you need a consistent set of external links, such as website, email, or community channels.',
        ]}
        whenNotToUse={[
          'For page actions or navigation within the app; keep those in the header or sidebar.',
          'Inside individual sections or cards; the footer belongs to the page shell.',
        ]}
        doNotes={[
          'Keep the link list short so it remains scannable when it wraps on mobile.',
        ]}
      />
      <PageContent>
        <PageContentSection title="With links prop">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginTop: 'var(--p-3)',
            }}
          >
            <Switch
              id="page-footer-mobile-preview"
              checked={isMobile}
              onCheckedChange={setIsMobile}
            />
            <Label htmlFor="page-footer-mobile-preview">Mobile</Label>
          </div>
          <div className={isMobile ? `${S.demo} ${S.isMobile}` : S.demo}>
            <PageFooter
              versionLink=""
              versionLabel="0.0.0"
              links={DEMO_LINKS}
            />
          </div>
        </PageContentSection>
      </PageContent>
    </>
  );
}
