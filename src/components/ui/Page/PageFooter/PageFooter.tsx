import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

import { GlobeIcon, MailIcon } from 'lucide-react';

import S from './PageFooter.styl';

export interface PageFooterProps {
  logo?: ReactNode;
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
}

export function PageFooter({
  children,
  versionLink,
  versionLabel,
  homeTo = '/',
  brandText = 'Sybilion',
  logo,
  websiteHref = 'https://sybilion.com',
  mailHref = 'mailto:support@sybilion.com',
  copyrightText = '© 2026 Sybilion. All rights reserved.',
}: PageFooterProps) {
  return (
    <footer className={S.root}>
      <div className={S.line}>
        <div className={S.logo}>
          <Link to={homeTo}>
            {logo}
            &nbsp;{brandText}
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
        <div className={S.copyright}>
          {copyrightText}
          <Link
            to={websiteHref}
            target="_blank"
            rel="noreferrer"
            aria-label="Visit Sybilion website"
          >
            <GlobeIcon />
          </Link>
          <a href={mailHref} aria-label="Contact support via email">
            <MailIcon />
          </a>
        </div>
      </div>
    </footer>
  );
}
