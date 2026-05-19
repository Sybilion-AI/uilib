import { jsx, jsxs, Fragment } from 'react/jsx-runtime';
import { shouldRenderAutolinkPill, AutolinkUrl } from '../../InteractiveContent/AutolinkUrl.js';
import logger from '../../../../lib/logger.js';
import S from './ChatMessage.styl.js';
import S$1 from '../../InteractiveContent/InteractiveContent.styl.js';

const injectHeaders = (content) => {
    // Match #, ##, ###, or #### headers at start of line
    const regex = /(^|\n)(#{1,4})\s+(.+?)(?=\n|$)/m;
    const matches = content.match(regex);
    if (!matches)
        return null;
    const level = matches[2].length;
    const headerText = matches[3].replace(/^\*+|\*+$/g, '');
    const Tag = level === 1 ? 'h1' : level === 2 ? 'h2' : level === 3 ? 'h3' : 'h4';
    // Calculate the actual match position and length
    // matches[0] includes the leading \n if present, but we want to replace from the # position
    const hasLeadingNewline = matches[1] === '\n';
    const startIndex = matches.index + (hasLeadingNewline ? 1 : 0);
    // Length is: # markers + space + header text (excluding leading newline)
    const length = matches[2].length + 1 + matches[3].length;
    return {
        elem: jsx(Tag, { children: headerText }),
        index: startIndex,
        length: length,
    };
};
/** Match sits inside list/table HTML (those blocks use dangerouslySetInnerHTML elsewhere). */
const isInsideHtmlListOrTable = (content, matchStartIndex) => {
    const before = content.substring(0, matchStartIndex);
    const lastOpen = Math.max(before.lastIndexOf('<ul'), before.lastIndexOf('<ol'), before.lastIndexOf('<table'));
    const lastClose = Math.max(before.lastIndexOf('</ul>'), before.lastIndexOf('</ol>'), before.lastIndexOf('</table>'));
    return lastOpen > lastClose;
};
const injectHTMLTags = (content) => {
    // Match <strong> or <b> tags (with optional whitespace, handles nested tags)
    const regex = /<(strong|b)\s*>([\s\S]*?)<\/\1\s*>/i;
    const matches = content.match(regex);
    if (!matches)
        return null;
    if (isInsideHtmlListOrTable(content, matches.index)) {
        return null;
    }
    return {
        elem: jsx("strong", { children: matches[2] }),
        index: matches.index,
        length: matches[0].length,
    };
};
const injectBold = (content) => {
    const regex = /\*\*([^*]+?)\*\*/;
    const matches = content.match(regex);
    if (!matches)
        return null;
    return {
        elem: jsx("strong", { children: matches[1] }),
        index: matches.index,
        length: matches[0].length,
    };
};
/** `_italic_` (underscore) — avoids clashing with `* ` bullet markers. */
const injectItalic = (content) => {
    const matches = content.match(/(?<![A-Za-z0-9])_([^_\n]+?)_(?![A-Za-z0-9])/);
    if (!matches || matches.index === undefined)
        return null;
    if (isInsideHtmlListOrTable(content, matches.index)) {
        return null;
    }
    return {
        elem: jsx("em", { children: matches[1] }),
        index: matches.index,
        length: matches[0].length,
    };
};
const injectBullet = (content) => {
    // Match bullet points: * or - followed by space
    // Match at start of string/line or after whitespace/colon (for nested bullets)
    // Then check manually that it's not part of **
    const regex = /(\n|^|[\s:])(\*|\-)\s/;
    const matches = content.match(regex);
    if (!matches)
        return null;
    // Skip if this is part of ** (double asterisk for bold)
    const bulletIndex = matches.index + matches[1].length;
    if (bulletIndex > 0 && content[bulletIndex - 1] === '*') {
        return null;
    }
    const hasLeadingNewline = matches[1] === '\n';
    return {
        elem: (jsxs(Fragment, { children: [hasLeadingNewline && jsx("br", {}), jsx("span", { className: S.bullet })] })),
        index: hasLeadingNewline ? matches.index : bulletIndex,
        length: (hasLeadingNewline ? 1 : 0) + matches[2].length + 1,
    };
};
const injectNewlines = (content) => {
    const regex = /\n/;
    const matches = content.match(regex);
    if (!matches)
        return null;
    return {
        elem: jsx("br", {}),
        index: matches.index,
        length: matches[0].length,
    };
};
const formatTableCellContent = (content) => {
    // Process markdown formatting in table cells
    // Currently supports bold (**text**)
    let result = content;
    // Process bold (**text**)
    result = result.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    return result;
};
const convertMarkdownTableToHTML = (text) => {
    // Find markdown tables by looking for header row followed by separator row
    // Then collect all subsequent rows that start with |
    const lines = text.split('\n');
    const replacements = [];
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
                const tableRows = [];
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
                    }
                    else if (rowLineTrimmed.length === 0) {
                        // Blank line ends the table
                        charPos += rowLine.length + 1;
                        break;
                    }
                    else {
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
                        if (leftAlign && rightAlign)
                            return 'center';
                        if (rightAlign)
                            return 'right';
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
/** http(s), mailto, or same-app path (single leading slash). */
const isAllowedHref = (href) => {
    const h = href.trim();
    if (!h)
        return false;
    if (/^https?:\/\//i.test(h))
        return true;
    if (/^mailto:/i.test(h))
        return true;
    if (h.startsWith('/') && !h.startsWith('//'))
        return true;
    return false;
};
const normalizeWwwToHttps = (raw) => {
    const t = raw.trim();
    if (/^www\./i.test(t))
        return `https://${t}`;
    return t;
};
/** Strip ASCII closing punctuation often pasted after URLs. */
const stripTrailingUrlPunctuation = (s) => {
    let u = s;
    while (u.length > 0 && /[.,;:!?)}\]]$/u.test(u)) {
        u = u.slice(0, -1);
    }
    return u;
};
function linkTargetRelForHref(href, explicitTarget) {
    if (explicitTarget) {
        const t = explicitTarget.trim();
        if (t.toLowerCase() === '_blank') {
            return { target: '_blank', rel: 'noopener noreferrer' };
        }
        return { target: t || undefined, rel: undefined };
    }
    if (/^https?:\/\//i.test(href) || /^mailto:/i.test(href)) {
        return { target: '_blank', rel: 'noopener noreferrer' };
    }
    return { target: undefined, rel: undefined };
}
const runFormattingPipeline = (text, injectors) => {
    let result = [text];
    try {
        injectors.forEach(fn => {
            let hasMore = true;
            while (hasMore) {
                hasMore = false;
                for (let i = 0; i < result.length; i++) {
                    const item = result[i];
                    if (typeof item === 'string') {
                        const res = fn(item);
                        if (!res)
                            continue;
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
    }
    catch (e) {
        logger.error('Formatting error:', e);
    }
    return result;
};
const linkLabelInjectors = [
    injectHTMLTags,
    injectBold,
    injectItalic,
    injectNewlines,
];
const injectMarkdownLink = (content) => {
    const matches = content.match(/\[([^\]]+)\]\(([^)]+)\)/);
    if (!matches || matches.index === undefined)
        return null;
    if (isInsideHtmlListOrTable(content, matches.index)) {
        return null;
    }
    const href = normalizeWwwToHttps(matches[2].trim());
    if (!isAllowedHref(href))
        return null;
    const { target, rel } = linkTargetRelForHref(href, undefined);
    const label = matches[1];
    return {
        elem: shouldRenderAutolinkPill(label, href) ? (jsx(AutolinkUrl, { href: href, display: label, target: target, rel: rel })) : (jsx("a", { href: href, target: target, rel: rel, className: S$1.textLink, children: runFormattingPipeline(label, linkLabelInjectors) })),
        index: matches.index,
        length: matches[0].length,
    };
};
const injectAutolinkUrl = (content) => {
    const candidates = [];
    const reHttp = /https?:\/\/[^\s<>"']+/gi;
    let hm;
    while ((hm = reHttp.exec(content)) !== null) {
        const href = stripTrailingUrlPunctuation(hm[0]);
        if (href.length >= (href.startsWith('https://') ? 8 : 7) &&
            isAllowedHref(href) &&
            /^https?:\/\//i.test(href)) {
            candidates.push({
                index: hm.index,
                length: href.length,
                href,
                display: href,
            });
        }
    }
    const reWww = /(^|[^A-Za-z0-9/])(www\.[^\s<>"']+)/gi;
    while ((hm = reWww.exec(content)) !== null) {
        const prefix = hm[1] ?? '';
        const rawWww = hm[2];
        const body = stripTrailingUrlPunctuation(rawWww);
        const href = `https://${body}`;
        if (body.length > 4 && isAllowedHref(href)) {
            candidates.push({
                index: hm.index + prefix.length,
                length: body.length,
                href,
                display: body,
            });
        }
    }
    if (candidates.length === 0)
        return null;
    candidates.sort((a, b) => a.index - b.index);
    const c = candidates[0];
    if (isInsideHtmlListOrTable(content, c.index)) {
        return null;
    }
    const { target, rel } = linkTargetRelForHref(c.href, undefined);
    return {
        elem: (jsx(AutolinkUrl, { href: c.href, display: c.display, target: target, rel: rel })),
        index: c.index,
        length: c.length,
    };
};
const injectAnchor = (content) => {
    const regex = /<a\s+([^>]+)>([\s\S]*?)<\/a\s*>/i;
    const matches = content.match(regex);
    if (!matches)
        return null;
    if (isInsideHtmlListOrTable(content, matches.index)) {
        return null;
    }
    const attrs = matches[1];
    const inner = matches[2];
    const hrefMatch = attrs.match(/href\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);
    const href = hrefMatch
        ? (hrefMatch[1] ?? hrefMatch[2] ?? hrefMatch[3] ?? '').trim()
        : '';
    const targetMatch = attrs.match(/target\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);
    const targetRaw = targetMatch
        ? (targetMatch[1] ?? targetMatch[2] ?? targetMatch[3] ?? '').trim()
        : '';
    if (!href || !isAllowedHref(href)) {
        return null;
    }
    const { target, rel } = linkTargetRelForHref(href, targetRaw || undefined);
    const innerTrimmed = inner.trim();
    return {
        elem: shouldRenderAutolinkPill(innerTrimmed, href) ? (jsx(AutolinkUrl, { href: href, display: innerTrimmed, target: target, rel: rel })) : (jsx("a", { href: href, target: target, rel: rel, className: S$1.textLink, children: runFormattingPipeline(inner, linkLabelInjectors) })),
        index: matches.index,
        length: matches[0].length,
    };
};
const applyFormatting = (text) => runFormattingPipeline(text, [
    injectHeaders,
    injectAnchor,
    injectMarkdownLink,
    injectHTMLTags,
    injectBullet,
    injectBold,
    injectItalic,
    injectAutolinkUrl,
    injectNewlines,
]);
const applyFormattingInline = (text) => runFormattingPipeline(text, [
    injectAnchor,
    injectMarkdownLink,
    injectHTMLTags,
    injectBold,
    injectItalic,
    injectAutolinkUrl,
    injectNewlines,
]);

export { applyFormatting, applyFormattingInline, convertMarkdownTableToHTML, injectAnchor, injectBold, injectBullet, injectHeaders, injectItalic, injectNewlines };
