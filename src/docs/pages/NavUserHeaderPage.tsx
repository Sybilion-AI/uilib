import { DropdownMenuItem } from '#uilib/components/ui/DropdownMenu';
import { NavUserHeader } from '#uilib/components/ui/NavUserHeader';
import { PageContentSection } from '#uilib/components/ui/Page';
import { GearSixIcon, UserCircleIcon } from '@phosphor-icons/react';

import { AppPageHeader } from '../components/AppPageHeader/AppPageHeader';
import { DocsGuidance } from '../components/DocsGuidance/DocsGuidance';
import { DocsHeaderActions } from '../docsHeaderActions';

export default function NavUserHeaderPage() {
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
        subheader="User menu with label, custom rows, theme toggle (docs ThemeProvider), and logout."
        actions={<DocsHeaderActions />}
      />
      <DocsGuidance
        overview="NavUserHeader shows the signed-in user with their name, email, and avatar, and opens a dropdown menu containing custom rows, a theme toggle, and a logout action. Use the compact variant where horizontal space is limited."
        whenToUse={[
          'In application chrome, such as a sidebar footer or top bar, to expose account-level actions.',
          'When the user needs quick access to profile, settings, theme, and logout from one place.',
        ]}
        whenNotToUse={[
          'For general-purpose menus not tied to the signed-in user; use DropdownMenu directly.',
          'On unauthenticated screens where there is no user to display.',
        ]}
        doNotes={[
          'Pass bespoke rows through menuItems rather than recreating the trigger and menu yourself.',
        ]}
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
