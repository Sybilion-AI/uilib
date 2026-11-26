import React from 'react';

import S from './InteractiveContent.styl';

type CodeBlockProps = {
  code: string;
  language?: string;
};

const JSON_LANGUAGES = new Set(['json', 'jsonc', 'json5']);

const isJsonLanguage = (language?: string) =>
  !!language && JSON_LANGUAGES.has(language.toLowerCase());

/** Pretty-print JSON when the block is JSON (by language tag, or untagged and parseable). */
export function formatCodeBlock(
  code: string,
  language?: string,
): { code: string; isJson: boolean } {
  const trimmed = code.trim();
  const looksLikeJson = /^[[{]/.test(trimmed);

  if (isJsonLanguage(language) || (!language && looksLikeJson)) {
    try {
      return {
        code: JSON.stringify(JSON.parse(trimmed), null, 2),
        isJson: true,
      };
    } catch {
      return { code, isJson: isJsonLanguage(language) };
    }
  }

  return { code, isJson: false };
}

const JSON_TOKEN_RE =
  /("(?:\\.|[^"\\])*")(\s*:)?|\b(true|false|null)\b|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)/g;

/** Light JSON highlighting: keys, strings, numbers, and literals. */
export function highlightJson(code: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  let last = 0;
  let match: RegExpExecArray | null;
  JSON_TOKEN_RE.lastIndex = 0;

  while ((match = JSON_TOKEN_RE.exec(code)) !== null) {
    if (match.index > last) nodes.push(code.slice(last, match.index));

    const [whole, str, colon, literal, num] = match;
    const key = nodes.length;

    if (str !== undefined) {
      nodes.push(
        <span key={key} className={colon ? S.tokenKey : S.tokenString}>
          {str}
        </span>,
      );
      if (colon) nodes.push(colon);
    } else if (literal !== undefined) {
      nodes.push(
        <span key={key} className={S.tokenLiteral}>
          {literal}
        </span>,
      );
    } else if (num !== undefined) {
      nodes.push(
        <span key={key} className={S.tokenNumber}>
          {num}
        </span>,
      );
    } else {
      nodes.push(whole);
    }

    last = match.index + whole.length;
  }

  if (last < code.length) nodes.push(code.slice(last));
  return nodes;
}

export function CodeBlock({ code, language }: CodeBlockProps) {
  const formatted = formatCodeBlock(code, language);

  return (
    <pre className={S.codeBlock} data-language={language || undefined}>
      <code>
        {formatted.isJson ? highlightJson(formatted.code) : formatted.code}
      </code>
    </pre>
  );
}
