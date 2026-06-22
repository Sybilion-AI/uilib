import type { Components } from 'react-markdown';
import ReactMarkdown from 'react-markdown';

import { PageContentSection } from '#uilib/components/ui/Page';
import remarkGfm from 'remark-gfm';

import { stripAgentFrontmatter } from '../../agent-guidance/agent-md-utils';
import S from './DocsGuidance.styl';

export interface DocsGuidanceProps {
  /** Markdown from AGENT.md (frontmatter stripped at render). */
  source: string;
}

function linkTargetRelForHref(href: string): { target?: string; rel?: string } {
  if (/^https?:\/\//i.test(href) || /^mailto:/i.test(href)) {
    return { target: '_blank', rel: 'noopener noreferrer' };
  }
  return {};
}

const markdownComponents: Components = {
  a: ({ href, children, ...props }) => {
    const safeHref = href ?? '';
    const { target, rel } = linkTargetRelForHref(safeHref);
    return (
      <a href={safeHref} target={target} rel={rel} {...props}>
        {children}
      </a>
    );
  },
};

export function DocsGuidance({ source }: DocsGuidanceProps) {
  const body = stripAgentFrontmatter(source);

  return (
    <PageContentSection grow={false} className={S.root}>
      <div className={S.markdown}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={markdownComponents}
        >
          {body}
        </ReactMarkdown>
      </div>
    </PageContentSection>
  );
}
