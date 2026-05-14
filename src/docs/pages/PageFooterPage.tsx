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
