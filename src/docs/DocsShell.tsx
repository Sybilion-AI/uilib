import { Outlet } from 'react-router-dom';

import { AppHeader } from '#uilib/components/ui/AppHeader';
import { PageFooter } from '#uilib/components/ui/Page/PageFooter/PageFooter';
import { PageMainContent } from '#uilib/components/ui/Page/PageMainContent/PageMainContent';
import { PageScroll } from '#uilib/components/ui/Page/PageScroll/PageScroll';
import { DocsSidebar } from '#uilib/docs/components/DocsSidebar/DocsSidebar';

import LogoSvg from '../../assets/logo.svg';
import S from './DocsShell.styl';

export function DocsShell() {
  return (
    <PageScroll className={S.root}>
      <div className={S.shell}>
        <DocsSidebar />

        <PageMainContent
          className={S.areaMain}
          header={<AppHeader />}
          footer={
            <PageFooter
              logo={<LogoSvg />}
              versionLink="/releases"
              versionLabel="1.0.0-docs"
            />
          }
        >
          <Outlet />
        </PageMainContent>
      </div>
    </PageScroll>
  );
}
