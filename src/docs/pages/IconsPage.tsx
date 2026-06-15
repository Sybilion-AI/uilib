import { useMemo, useRef, useState } from 'react';

import { Input } from '#uilib/components/ui/Input';
import { PageContentSection } from '#uilib/components/ui/Page';
import { Activity, icons } from 'lucide-react';

import { AppPageHeader } from '../components/AppPageHeader/AppPageHeader';
import { DocsGuidance } from '../components/DocsGuidance/DocsGuidance';
import { DocsHeaderActions } from '../docsHeaderActions';
import S from './IconsPage.styl';

const ALL_ICONS = Object.entries(icons);
const VISIBLE_LIMIT = 300;
const ICON_STROKE = 1.5;

const SIZE_TOKENS = [
  { token: '--icon-size-sm', label: '14px' },
  { token: '--icon-size-md', label: '16px' },
  { token: '--icon-size-lg', label: '20px' },
  { token: '--icon-size-xl', label: '24px' },
];

export default function IconsPage() {
  const [query, setQuery] = useState('');
  const [copiedName, setCopiedName] = useState('');
  const copyTimeoutRef = useRef(0);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ALL_ICONS;
    return ALL_ICONS.filter(([name]) => name.toLowerCase().includes(q));
  }, [query]);

  const visible = matches.slice(0, VISIBLE_LIMIT);
  const hiddenCount = matches.length - visible.length;

  const copyName = (name: string) => {
    void navigator.clipboard.writeText(name);
    setCopiedName(name);
    window.clearTimeout(copyTimeoutRef.current);
    copyTimeoutRef.current = window.setTimeout(() => setCopiedName(''), 1200);
  };

  return (
    <>
      <AppPageHeader
        breadcrumbs={[{ label: 'Icons' }]}
        title="Icons"
        subheader="The full Lucide icon set, rendered at the system stroke and sizes."
        actions={<DocsHeaderActions />}
      />
      <DocsGuidance
        overview="Icons come from the lucide-react package and are drawn at a 1.5px stroke (--icon-stroke). Use the --icon-size-* tokens to pick a size that matches the surrounding text, and keep one consistent size within a control or list."
        whenToUse={[
          'To reinforce the meaning of an action, status, or category next to its label.',
          'As the only content of a square icon button, paired with an aria-label.',
        ]}
        whenNotToUse={[
          'To decorate text that is already clear on its own.',
          'For brand or product marks; use the Logo component instead.',
        ]}
      />
      <PageContentSection>
        <h3>Sizes</h3>
        <p className={S.sectionNote}>
          One glyph at each size token, stroke 1.5.
        </p>
        <div className={S.sizesRow}>
          {SIZE_TOKENS.map(({ token, label }) => (
            <div key={token} className={S.sizeItem}>
              <Activity
                strokeWidth={ICON_STROKE}
                style={{ width: `var(${token})`, height: `var(${token})` }}
              />
              <span className={S.tokenName}>
                {token} · {label}
              </span>
            </div>
          ))}
        </div>
      </PageContentSection>
      <PageContentSection>
        <h3>Gallery</h3>
        <div className={S.toolbar}>
          <Input
            type="search"
            placeholder="Filter icons by name…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            aria-label="Filter icons by name"
          />
          <span className={S.count}>
            {matches.length} of {ALL_ICONS.length} icons
          </span>
        </div>
        <div className={S.grid}>
          {visible.map(([name, Icon]) => (
            <button
              key={name}
              type="button"
              className={
                copiedName === name ? `${S.cell} ${S.cellCopied}` : S.cell
              }
              onClick={() => copyName(name)}
              title={`Copy “${name}” to clipboard`}
            >
              <Icon size={20} strokeWidth={ICON_STROKE} />
              <span className={S.cellName}>
                {copiedName === name ? 'Copied' : name}
              </span>
            </button>
          ))}
        </div>
        {hiddenCount > 0 && (
          <p className={S.more}>
            {hiddenCount} more match — refine the filter to see them.
          </p>
        )}
        {matches.length === 0 && (
          <p className={S.more}>No icons match “{query.trim()}”.</p>
        )}
      </PageContentSection>
    </>
  );
}
