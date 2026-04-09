import { Button } from '@/components/ui/Button';
import { PageFooter } from '@/components/ui/Page/PageFooter/PageFooter';
import { PageHeader } from '@/components/ui/Page/PageHeader/PageHeader';
import { PageScroll } from '@/components/ui/Page/PageScroll/PageScroll';

import S from './App.styl';

export default function App() {
  return (
    <PageScroll className={S.root}>
      <PageHeader
        breadcrumbSidebarTrigger={false}
        breadcrumbs={[{ label: 'Docs' }]}
        title="Sybilion uilib"
        subheader="Docs shell — Webpack + Stylus + React."
        actions={<Button type="button">Sample button</Button>}
      />
      <div className={S.content}>

        <p >
          Scroll this area to exercise PageScroll; header uses PageContext for
          scrolled styling when scroll tracking is enabled.
        </p>
      </div>
        <PageFooter versionLink="/releases" versionLabel="1.0.0-docs">
          <p >
            Optional middle slot: compose app-only UI here (debug panel, forms).
          </p>
        </PageFooter>
    </PageScroll>
  );
}
