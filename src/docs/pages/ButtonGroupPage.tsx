import { useState } from 'react';

import { Button } from '#uilib/components/ui/Button';
import { ButtonGroup } from '#uilib/components/ui/ButtonGroup';
import buttonGroupGuidance from '#uilib/components/ui/ButtonGroup/AGENT.md';
import { PageContentSection } from '#uilib/components/ui/Page';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { AppPageHeader } from '../components/AppPageHeader/AppPageHeader';
import { DocsGuidance } from '../components/DocsGuidance/DocsGuidance';
import { DocsHeaderActions } from '../docsHeaderActions';

export default function ButtonGroupPage() {
  const [value, setValue] = useState('day');

  return (
    <>
      <AppPageHeader
        breadcrumbs={[{ label: 'ButtonGroup' }]}
        title="ButtonGroup"
        subheader="Mold adjacent buttons into a segmented control."
        actions={<DocsHeaderActions />}
      />
      <DocsGuidance source={buttonGroupGuidance} />
      <PageContentSection
        style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}
      >
        <section>
          <ButtonGroup>
            {['day', 'week', 'month'].map(item => (
              <Button
                key={item}
                type="button"
                variant={item === value ? 'default' : 'outline'}
                onClick={() => setValue(item)}
              >
                {item}
              </Button>
            ))}
          </ButtonGroup>
        </section>
      </PageContentSection>
    </>
  );
}
