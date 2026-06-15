import type { ReactNode } from 'react';

import { PageContentSection } from '#uilib/components/ui/Page';

import S from './DocsGuidance.styl';

export interface DocsGuidanceProps {
  /** 1-3 sentence description of what the component is and how to use it. */
  overview: ReactNode;
  /** Bullet points describing situations where the component fits. */
  whenToUse?: ReactNode[];
  /** Bullet points describing situations where another pattern fits better. */
  whenNotToUse?: ReactNode[];
  /** Optional short "do" guidance notes. */
  doNotes?: ReactNode[];
  /** Optional short "don't" guidance notes. */
  dontNotes?: ReactNode[];
}

function GuidanceList({
  heading,
  items,
}: {
  heading: string;
  items?: ReactNode[];
}) {
  if (!items?.length) return null;

  return (
    <div className={S.block}>
      <h4 className={S.heading}>{heading}</h4>
      <ul className={S.list}>
        {items.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

export function DocsGuidance({
  overview,
  whenToUse,
  whenNotToUse,
  doNotes,
  dontNotes,
}: DocsGuidanceProps) {
  return (
    <PageContentSection grow={false} className={S.root}>
      <p className={S.overview}>{overview}</p>
      <GuidanceList heading="When to use" items={whenToUse} />
      <GuidanceList heading="When not to use" items={whenNotToUse} />
      <GuidanceList heading="Do" items={doNotes} />
      <GuidanceList heading="Don't" items={dontNotes} />
    </PageContentSection>
  );
}
