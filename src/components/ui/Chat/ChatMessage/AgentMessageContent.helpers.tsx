import React from 'react';

import logger from '@/lib/logger';

import S from './ChatMessage.styl';

const injectHeaders = (content: string) => {
  // Match #, ##, ###, or #### headers at start of line
  const regex = /(^|\n)(#{1,4})\s+(.+?)(?=\n|$)/m;
  const matches = content.match(regex);

  if (!matches) return null;

  const level = matches[2].length;
  const headerText = matches[3].replace(/^\*+|\*+$/g, '');
  const Tag =
    level === 1 ? 'h1' : level === 2 ? 'h2' : level === 3 ? 'h3' : 'h4';

  // Calculate the actual match position and length
  // matches[0] includes the leading \n if present, but we want to replace from the # position
  const hasLeadingNewline = matches[1] === '\n';
  const startIndex = matches.index! + (hasLeadingNewline ? 1 : 0);
  // Length is: # markers + space + header text (excluding leading newline)
  const length = matches[2].length + 1 + matches[3].length;

  return {
    elem: <Tag>{headerText}</Tag>,
    index: startIndex,
    length: length,
  };
};

const injectHTMLTags = (content: string) => {
  // Match <strong> or <b> tags (with optional whitespace, handles nested tags)
  const regex = /<(strong|b)\s*>([\s\S]*?)<\/\1\s*>/i;
  const matches = content.match(regex);

  if (!matches) return null;

  // Don't process if this is inside a list/table tag (those are handled separately)
  const beforeMatch = content.substring(0, matches.index!);
  const lastListTag = Math.max(
    beforeMatch.lastIndexOf('<ul'),
    beforeMatch.lastIndexOf('<ol'),
    beforeMatch.lastIndexOf('<table'),
  );
  const lastClosingTag = Math.max(
    beforeMatch.lastIndexOf('</ul>'),
    beforeMatch.lastIndexOf('</ol>'),
    beforeMatch.lastIndexOf('</table>'),
  );

  // If we're inside a list/table, skip processing (it will be handled by dangerouslySetInnerHTML)
  if (lastListTag > lastClosingTag) {
    return null;
  }

  return {
    elem: <strong>{matches[2]}</strong>,
    index: matches.index!,
    length: matches[0].length,
  };
};

const injectBold = (content: string) => {
  const regex = /\*\*([^*]+?)\*\*/;
  const matches = content.match(regex);

  if (!matches) return null;

  return {
    elem: <strong>{matches[1]}</strong>,
    index: matches.index!,
    length: matches[0].length,
  };
};

const injectBullet = (content: string) => {
  // Match bullet points: * or - followed by space
  // Match at start of string/line or after whitespace/colon (for nested bullets)
  // Then check manually that it's not part of **
  const regex = /(\n|^|[\s:])(\*|\-)\s/;
  const matches = content.match(regex);

  if (!matches) return null;

  // Skip if this is part of ** (double asterisk for bold)
  const bulletIndex = matches.index! + matches[1].length;
  if (bulletIndex > 0 && content[bulletIndex - 1] === '*') {
    return null;
  }

  const hasLeadingNewline = matches[1] === '\n';
  return {
    elem: (
      <>
        {hasLeadingNewline && <br />}
        <span className={(S as any).bullet} />
      </>
    ),
    index: hasLeadingNewline ? matches.index! : bulletIndex,
    length: (hasLeadingNewline ? 1 : 0) + matches[2].length + 1,
  };
};

const injectNewlines = (content: string) => {
  const regex = /\n/;
  const matches = content.match(regex);

  if (!matches) return null;

  return {
    elem: <br />,
    index: matches.index!,
    length: matches[0].length,
  };
};

const formatTableCellContent = (content: string): string => {
  // Process markdown formatting in table cells
  // Currently supports bold (**text**)
  let result = content;

  // Process bold (**text**)
  result = result.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  return result;
};

const convertMarkdownTableToHTML = (text: string): string => {
  // Find markdown tables by looking for header row followed by separator row
  // Then collect all subsequent rows that start with |
  const lines = text.split('\n');
  const replacements: Array<{
    start: number;
    end: number;
    replacement: string;
  }> = [];

  // Track character positions as we iterate
  let charPos = 0;
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const lineTrimmed = line.trim();
    const lineStartPos = charPos;

    // Check if this line looks like a table header (starts with |)
    if (lineTrimmed.startsWith('|') && i + 1 < lines.length) {
      const nextLineTrimmed = lines[i + 1].trim();

      // Check if next line is a separator row (contains : and -)
      if (nextLineTrimmed.startsWith('|') && /[:|\-]/.test(nextLineTrimmed)) {
        // Found a table! Collect all rows
        const tableRows: string[] = [];
        let rowIndex = i;
        let tableStartPos = lineStartPos;

        // Collect header and separator
        tableRows.push(lineTrimmed);
        tableRows.push(nextLineTrimmed);
        rowIndex = i + 2;
        charPos += line.length + 1; // +1 for newline
        charPos += lines[i + 1].length + 1;

        // Collect all data rows until we hit a blank line or non-table line
        while (rowIndex < lines.length) {
          const rowLine = lines[rowIndex];
          const rowLineTrimmed = rowLine.trim();
          if (rowLineTrimmed.startsWith('|')) {
            tableRows.push(rowLineTrimmed);
            charPos += rowLine.length + 1;
            rowIndex++;
          } else if (rowLineTrimmed.length === 0) {
            // Blank line ends the table
            charPos += rowLine.length + 1;
            break;
          } else {
            // Non-table line ends the table
            break;
          }
        }

        const tableEndPos = charPos;

        // Parse the table
        if (tableRows.length >= 2) {
          const headerRow = tableRows[0];
          const separatorRow = tableRows[1];
          const dataRows = tableRows.slice(2);

          // Parse header cells
          const headerCells = headerRow
            .split('|')
            .map(cell => cell.trim())
            .filter(cell => cell.length > 0);

          // Parse alignment from separator row
          const alignments = separatorRow
            .split('|')
            .map(cell => cell.trim())
            .filter(cell => cell.length > 0)
            .map(cell => {
              const leftAlign = cell.startsWith(':');
              const rightAlign = cell.endsWith(':');
              if (leftAlign && rightAlign) return 'center';
              if (rightAlign) return 'right';
              return 'left';
            });

          // Build HTML table
          let htmlTable = '<table>';

          // Header row
          htmlTable += '<thead><tr>';
          headerCells.forEach((cell, idx) => {
            const align = alignments[idx] || 'left';
            const formattedCell = formatTableCellContent(cell);
            htmlTable += `<th style="text-align: ${align}">${formattedCell}</th>`;
          });
          htmlTable += '</tr></thead>';

          // Data rows
          if (dataRows.length > 0) {
            htmlTable += '<tbody>';
            dataRows.forEach(row => {
              const cells = row
                .split('|')
                .map(cell => cell.trim())
                .filter(cell => cell.length > 0);

              htmlTable += '<tr>';
              cells.forEach((cell, idx) => {
                const align = alignments[idx] || 'left';
                const formattedCell = formatTableCellContent(cell);
                htmlTable += `<td style="text-align: ${align}">${formattedCell}</td>`;
              });
              htmlTable += '</tr>';
            });
            htmlTable += '</tbody>';
          }

          htmlTable += '</table>';

          replacements.push({
            start: tableStartPos,
            end: tableEndPos,
            replacement: htmlTable,
          });

          i = rowIndex;
          continue;
        }
      }
    }

    charPos += line.length + 1; // +1 for newline
    i++;
  }

  // Apply replacements in reverse order
  let result = text;
  for (let i = replacements.length - 1; i >= 0; i--) {
    const { start, end, replacement } = replacements[i];
    result = result.substring(0, start) + replacement + result.substring(end);
  }

  return result;
};

type Injector = (
  content: string,
) => { elem: React.ReactNode; index: number; length: number } | null;

const runFormattingPipeline = (
  text: string,
  injectors: Injector[],
): React.ReactNode[] => {
  let result: React.ReactNode[] = [text];

  try {
    injectors.forEach(fn => {
      let hasMore = true;
      while (hasMore) {
        hasMore = false;
        for (let i = 0; i < result.length; i++) {
          const item = result[i];

          if (typeof item === 'string') {
            const res = fn(item);

            if (!res) continue;

            const { elem, index, length } = res;

            if (index >= 0) {
              const before = item.substring(0, index);
              const after = item.substring(index + length);

              result.splice(i, 1, before, elem, after);
              hasMore = true;
              break;
            }
          }
        }
      }
    });
  } catch (e) {
    logger.error('Formatting error:', e);
  }

  return result;
};

const applyFormatting = (text: string): React.ReactNode[] =>
  runFormattingPipeline(text, [
    injectHeaders,
    injectHTMLTags,
    injectBullet,
    injectBold,
    injectNewlines,
  ]);

const applyFormattingInline = (text: string): React.ReactNode[] =>
  runFormattingPipeline(text, [injectHTMLTags, injectBold, injectNewlines]);

export {
  injectHeaders,
  injectBold,
  injectBullet,
  injectNewlines,
  convertMarkdownTableToHTML,
  applyFormatting,
  applyFormattingInline,
};
