import { useState } from 'react';

import { PageContentSection } from '#uilib/components/ui/Page';
import { Slider } from '#uilib/components/ui/Slider';
import sliderGuidance from '#uilib/docs/agent-guidance/slider.md';

import { AppPageHeader } from '../components/AppPageHeader/AppPageHeader';
import { DocsGuidance } from '../components/DocsGuidance/DocsGuidance';
import { DocsHeaderActions } from '../docsHeaderActions';

const VALUE_DEMOS = [
  { label: '0%', value: 0 },
  { label: '50%', value: 50 },
  { label: '100%', value: 100 },
] as const;

const RANGE_DEMOS = [
  { label: '0–100 (step 1)', min: 0, max: 100, step: 1, value: 40 },
  { label: '0–10 (step 1)', min: 0, max: 10, step: 1, value: 7 },
  { label: '0–1000 (step 100)', min: 0, max: 1000, step: 100, value: 500 },
] as const;

const SLIDER_WIDTH = 280;

export default function SliderPage() {
  const [v, setV] = useState([40]);

  return (
    <>
      <AppPageHeader
        breadcrumbs={[{ label: 'Slider' }]}
        title="Slider"
        subheader="Value positions, range configurations, and disabled state."
        actions={<DocsHeaderActions />}
      />
      <DocsGuidance source={sliderGuidance} />
      <PageContentSection
        style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}
      >
        <section>
          <h3 style={{ marginBottom: '1rem' }}>Interactive</h3>
          <Slider
            value={v}
            onValueChange={setV}
            max={100}
            step={1}
            style={{ width: SLIDER_WIDTH }}
          />
          <p style={{ marginTop: 8, fontSize: 14 }}>Value: {v[0]}</p>
        </section>
        <section>
          <h3 style={{ marginBottom: '1rem' }}>Disabled</h3>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
            }}
          >
            <Slider
              defaultValue={[25]}
              max={100}
              step={1}
              disabled
              style={{ width: SLIDER_WIDTH }}
            />
            <Slider
              defaultValue={[75]}
              max={100}
              step={1}
              disabled
              style={{ width: SLIDER_WIDTH }}
            />
          </div>
        </section>
      </PageContentSection>
    </>
  );
}
