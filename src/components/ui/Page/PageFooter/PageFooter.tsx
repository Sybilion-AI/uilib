import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

import { Logo } from '#uilib/components/ui/Logo';
import { GlobeIcon, MailIcon } from 'lucide-react';

import S from './PageFooter.styl';

export interface PageFooterLinkItem {
  id: string;
  label: ReactNode;
  url: string;
  /** For icon-only or non-text labels (screen readers). */
  ariaLabel?: string;
}

export interface PageFooterProps {
  /** Rendered between logo block and copyright (e.g. debug UI from the app). */
  children?: ReactNode;
  /** When non-empty, version badge links here (e.g. `/releases`). */
  versionLink: string;
  /** Visible semver or build label inside the version link. */
  versionLabel: string;
  homeTo?: string;
  brandText?: string;
  websiteHref?: string;
  mailHref?: string;
  copyrightText?: string;
  /**
   * Footer links. When set (including `[]`), replaces default website + email icons.
   * Omit to keep icon links from `websiteHref` / `mailHref`.
   */
  links?: PageFooterLinkItem[];
}

function PageFooterLinkEl({ item }: { item: PageFooterLinkItem }): ReactNode {
  const { label, url, ariaLabel } = item;
  const openInNewTab = /^https?:\/\//i.test(url);

  return (
    <a
      href={url}
      className={S.link}
      {...(ariaLabel !== undefined ? { 'aria-label': ariaLabel } : {})}
      {...(openInNewTab ? { target: '_blank', rel: 'noreferrer' } : {})}
    >
      {label}
    </a>
  );
}

export function PageFooter({
  children,
  versionLink,
  versionLabel,
  homeTo = '/',
  brandText = 'Sybilion',
  websiteHref = 'https://sybilion.com',
  mailHref = 'mailto:support@sybilion.com',
  copyrightText = '© 2026 Sybilion. All rights reserved.',
  links: linksProp,
}: PageFooterProps) {
  const resolvedLinks: PageFooterLinkItem[] =
    linksProp !== undefined
      ? linksProp
      : [
          {
            id: 'website',
            label: <GlobeIcon aria-hidden />,
            url: websiteHref,
            ariaLabel: 'Visit Sybilion website',
          },
          {
            id: 'email',
            label: <MailIcon aria-hidden />,
            url: mailHref,
            ariaLabel: 'Contact support via email',
          },
        ];

  return (
    <footer className={S.root}>
      <div className={S.line}>
        <div className={S.logo}>
          <Link to={homeTo}>
            <Logo brandText={brandText} />
          </Link>
          {versionLink !== '' && (
            <div className={S.version}>
              <Link to={versionLink} className={S.versionLink}>
                {versionLabel}
              </Link>
            </div>
          )}
        </div>
        {children}
        <div className={S.meta}>
          <div className={S.copyright}>{copyrightText}</div>
          {resolvedLinks.length > 0 && (
            <nav className={S.links} aria-label="Footer links">
              {resolvedLinks.map(item => (
                <PageFooterLinkEl key={item.id} item={item} />
              ))}
            </nav>
          )}
        </div>
      </div>
    </footer>
  );
}
