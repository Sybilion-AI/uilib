import { InteractiveContent } from '#uilib/components/ui/InteractiveContent';
import { PageContentSection } from '#uilib/components/ui/Page';

import { stripAgentFrontmatter } from '../../agent-guidance/agent-md-utils';
import S from './DocsGuidance.styl';

export interface DocsGuidanceProps {
  /** Markdown from AGENT.md (frontmatter stripped at render). */
  source: string;
}

export function DocsGuidance({ source }: DocsGuidanceProps) {
  const body = stripAgentFrontmatter(source);

  return (
    <PageContentSection grow={false} className={S.root}>
      <div className={S.markdown}>
        <InteractiveContent text={body} variant="full" />
      </div>
    </PageContentSection>
  );
}
