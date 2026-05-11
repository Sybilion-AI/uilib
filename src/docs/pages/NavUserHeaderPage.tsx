import { useCallback, useEffect, useState } from 'react';

import { DropdownMenuItem } from '#uilib/components/ui/DropdownMenu';
import { NavUserHeader } from '#uilib/components/ui/NavUserHeader';
import { PageContentSection } from '#uilib/components/ui/Page';
import { GearSixIcon, UserCircleIcon } from '@phosphor-icons/react';

import { AppPageHeader } from '../components/AppPageHeader/AppPageHeader';
import { DocsHeaderActions } from '../docsHeaderActions';

export default function NavUserHeaderPage() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    return () => {
      delete document.documentElement.dataset.theme;
    };
  }, [theme]);

  const onThemeToggle = useCallback(() => {
    setTheme(t => (t === 'dark' ? 'light' : 'dark'));
  }, []);

  const customMenuItems = (
    <>
      <DropdownMenuItem>
        <UserCircleIcon />
        Account (custom)
      </DropdownMenuItem>
      <DropdownMenuItem>
        <GearSixIcon />
        Settings (custom)
      </DropdownMenuItem>
    </>
  );

  return (
    <>
      <AppPageHeader
        breadcrumbs={[{ label: 'NavUserHeader' }]}
        title="NavUserHeader"
        subheader="User menu with label, custom rows, theme toggle, and logout."
        actions={<DocsHeaderActions />}
      />
      <PageContentSection
        style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem' }}
      >
        <div>
          <p style={{ marginBottom: 8, fontSize: 12 }}>
            Signed in · default variant
          </p>
          <NavUserHeader
            user={{
              name: 'Demo Analyst',
              email: 'demo@sybilion.io',
              avatar: '',
            }}
            theme={theme}
            onThemeToggle={onThemeToggle}
            onLogout={() => {
              console.info('[docs] logout');
            }}
            menuItems={customMenuItems}
          />
        </div>
        <div>
          <p style={{ marginBottom: 8, fontSize: 12 }}>
            Signed in · compact variant
          </p>
          <NavUserHeader
            variant="compact"
            user={{
              name: 'Compact',
              email: 'compact@sybilion.io',
              avatar: '',
            }}
            theme={theme}
            onThemeToggle={onThemeToggle}
            onLogout={() => {
              console.info('[docs] logout compact');
            }}
            menuItems={customMenuItems}
          />
        </div>
      </PageContentSection>
    </>
  );
}
