import { LinkIcon } from 'lucide-react';

import S from './InteractiveContent.styl';

type AutolinkUrlProps = {
  href: string;
  display: string;
  target?: string;
  rel?: string;
};

export function displayUrlForAutolink(display: string): string {
  if (display.startsWith('https://')) return display.slice(8);
  if (display.startsWith('http://')) return display.slice(7);
  return display;
}

export function shouldRenderAutolinkPill(label: string, href: string): boolean {
  const normalizedLabel = label.trim();
  const normalizedHref = href.trim();
  if (!normalizedLabel || !normalizedHref) return false;

  const labelAsHref = normalizeWwwToHttps(normalizedLabel);
  if (labelAsHref === normalizedHref) return true;

  return (
    /^https?:\/\//i.test(normalizedLabel) ||
    /^www\./i.test(normalizedLabel) ||
    normalizedLabel === displayUrlForAutolink(normalizedHref)
  );
}

const normalizeWwwToHttps = (raw: string): string => {
  const t = raw.trim();
  if (/^www\./i.test(t)) return `https://${t}`;
  return t;
};

export function AutolinkUrl({ href, display, target, rel }: AutolinkUrlProps) {
  return (
    <a href={href} target={target} rel={rel} className={S.autolinkUrl}>
      <LinkIcon size={12} aria-hidden className={S.autolinkUrlIcon} />
      <span
        className={S.autolinkUrlLabel}
        title={displayUrlForAutolink(display)}
      >
        {displayUrlForAutolink(display)}
      </span>
    </a>
  );
}

export { S as autolinkStyles };
