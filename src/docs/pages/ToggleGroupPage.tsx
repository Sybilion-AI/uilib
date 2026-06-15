import { useState } from 'react';

import { PageContentSection } from '#uilib/components/ui/Page';
import { ToggleGroup, ToggleGroupItem } from '#uilib/components/ui/ToggleGroup';

import { AppPageHeader } from '../components/AppPageHeader/AppPageHeader';
import { DocsGuidance } from '../components/DocsGuidance/DocsGuidance';
import { DocsHeaderActions } from '../docsHeaderActions';

export default function ToggleGroupPage() {
  const [v, setV] = useState('left');

  return (
    <>
      <AppPageHeader
        breadcrumbs={[{ label: 'ToggleGroup' }]}
        title="ToggleGroup"
        subheader="Single-select group."
        actions={<DocsHeaderActions />}
      />
      <DocsGuidance
        overview="ToggleGroup presents a set of related toggle buttons where, in single mode, exactly one option is active at a time. It suits compact, mutually exclusive choices such as alignment or view mode."
        whenToUse={[
          'To switch between a few mutually exclusive options, such as left, centre, and right alignment.',
          'For view switches, such as list versus grid, where the choice takes effect immediately.',
        ]}
        whenNotToUse={[
          'For more than roughly five options; use a Select or RadioGroup instead.',
          'To switch panels of content; use Tabs instead.',
        ]}
        doNotes={[
          'In single mode, ignore empty values from onValueChange so one option always stays selected.',
        ]}
      />
      <PageContentSection>
        <ToggleGroup
          type="single"
          value={v}
          onValueChange={val => {
            if (val) setV(val);
          }}
        >
          <ToggleGroupItem value="left">Left</ToggleGroupItem>
          <ToggleGroupItem value="center">Center</ToggleGroupItem>
          <ToggleGroupItem value="right">Right</ToggleGroupItem>
        </ToggleGroup>
      </PageContentSection>
    </>
  );
}
