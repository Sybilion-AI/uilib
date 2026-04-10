import { Button } from '#uilib/components/ui/Button';
import { PageFooter } from '#uilib/components/ui/Page/PageFooter/PageFooter';
import { PageHeader } from '#uilib/components/ui/Page/PageHeader/PageHeader';
import { PageScroll } from '#uilib/components/ui/Page/PageScroll/PageScroll';

import LogoSvg from '../../../assets/logo.svg';
import S from './App.styl';
import { ThemeToggle } from './ThemeToggle';

export default function App() {
  return (
    <PageScroll className={S.root}>
      <PageHeader
        breadcrumbSidebarTrigger={false}
        breadcrumbs={[{ label: 'Docs' }]}
        title="Sybilion uilib"
        subheader="Docs shell — Webpack + Stylus + React."
        actions={<ThemeToggle />}
      />
      <div className={S.content}>
        <Button type="button">Sample button</Button>

        <p>
          Scroll this area to exercise PageScroll; header uses PageContext for
          scrolled styling when scroll tracking is enabled.
        </p>
      </div>
      <PageFooter
        logo={<LogoSvg />}
        versionLink="/releases"
        versionLabel="1.0.0-docs"
      >
        <p>
          Optional middle slot: compose app-only UI here (debug panel, forms).
        </p>
      </PageFooter>
    </PageScroll>
  );
}
