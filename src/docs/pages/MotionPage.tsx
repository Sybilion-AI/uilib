import { useEffect, useRef, useState } from 'react';

import { PageContentSection } from '#uilib/components/ui/Page';
import { Tabs, TabsList, TabsTrigger } from '#uilib/components/ui/Tabs';
import { ToggleGroup, ToggleGroupItem } from '#uilib/components/ui/ToggleGroup';
import motionGuidance from '#uilib/docs/agent-guidance/motion.md';

import { AppPageHeader } from '../components/AppPageHeader/AppPageHeader';
import { DocsGuidance } from '../components/DocsGuidance/DocsGuidance';
import { DocsHeaderActions } from '../docsHeaderActions';
import S from './MotionPage.styl';

const TOKENS = [
  { token: '--ease-standard', value: 'cubic-bezier(0.2, 0.6, 0.2, 1)' },
  { token: '--ease-exit', value: 'cubic-bezier(0.4, 0, 1, 1)' },
  { token: '--dur-fast', value: '120ms' },
  { token: '--dur-base', value: '200ms' },
  { token: '--dur-slow', value: '400ms' },
];

type DemoTab = 'dur' | 'ease';

type EaseToken = '--ease-standard' | '--ease-exit';
type DurationToken = '--dur-fast' | '--dur-base' | '--dur-slow';

const EASES: EaseToken[] = ['--ease-standard', '--ease-exit'];
const DURATIONS: DurationToken[] = ['--dur-fast', '--dur-base', '--dur-slow'];

function isDemoTab(value: string): value is DemoTab {
  return value === 'dur' || value === 'ease';
}

function isEaseToken(value: string): value is EaseToken {
  return value === '--ease-standard' || value === '--ease-exit';
}

function isDurationToken(value: string): value is DurationToken {
  return (
    value === '--dur-fast' || value === '--dur-base' || value === '--dur-slow'
  );
}

function AnimatedDot({
  duration,
  easing,
}: {
  duration: DurationToken;
  easing: EaseToken;
}) {
  const [atEnd, setAtEnd] = useState(false);

  useEffect(() => {
    let frame2 = 0;
    const frame1 = window.requestAnimationFrame(() => {
      frame2 = window.requestAnimationFrame(() => setAtEnd(true));
    });
    return () => {
      window.cancelAnimationFrame(frame1);
      window.cancelAnimationFrame(frame2);
    };
  }, []);

  return (
    <div
      className={atEnd ? `${S.dot} ${S.dotEnd}` : S.dot}
      style={{
        transition: `transform var(${duration}) var(${easing})`,
      }}
    />
  );
}

export default function MotionPage() {
  const [demoTab, setDemoTab] = useState<DemoTab>('dur');
  const [selectedEase, setSelectedEase] =
    useState<EaseToken>('--ease-standard');
  const [selectedDuration, setSelectedDuration] =
    useState<DurationToken>('--dur-base');
  const [replayKey, setReplayKey] = useState(0);
  const skipReplayRef = useRef(true);

  useEffect(() => {
    if (skipReplayRef.current) {
      skipReplayRef.current = false;
      return;
    }
    setReplayKey(key => key + 1);
  }, [demoTab, selectedEase, selectedDuration]);

  return (
    <>
      <AppPageHeader
        breadcrumbs={[{ label: 'Motion' }]}
        title="Motion"
        subheader="Easing curves and duration tokens for transitions."
        actions={<DocsHeaderActions />}
      />
      <DocsGuidance source={motionGuidance} />
      <PageContentSection>
        <h3>Tokens</h3>
        <div className={S.tokenList}>
          {TOKENS.map(({ token, value }) => (
            <div key={token} className={S.tokenRow}>
              <span className={S.token}>{token}</span>
              <span className={S.value}>{value}</span>
            </div>
          ))}
        </div>
      </PageContentSection>
      <PageContentSection>
        <h3>Transition demo</h3>
        <Tabs
          variant="button"
          value={demoTab}
          onValueChange={value => {
            if (isDemoTab(value)) setDemoTab(value);
          }}
        >
          <TabsList>
            <TabsTrigger value="dur">Duration</TabsTrigger>
            <TabsTrigger value="ease">Easing</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className={S.tokenPicker}>
          {demoTab === 'dur' ? (
            <ToggleGroup
              type="single"
              value={selectedDuration}
              onValueChange={value => {
                if (isDurationToken(value)) setSelectedDuration(value);
              }}
            >
              {DURATIONS.map(token => (
                <ToggleGroupItem key={token} value={token}>
                  {token}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          ) : (
            <ToggleGroup
              type="single"
              value={selectedEase}
              onValueChange={value => {
                if (isEaseToken(value)) setSelectedEase(value);
              }}
            >
              {EASES.map(token => (
                <ToggleGroupItem key={token} value={token}>
                  {token}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          )}
        </div>
        <p className={S.demoSummary}>
          {selectedEase} · {selectedDuration}
        </p>
        <div className={S.track}>
          <AnimatedDot
            key={replayKey}
            duration={selectedDuration}
            easing={selectedEase}
          />
        </div>
      </PageContentSection>
    </>
  );
}
