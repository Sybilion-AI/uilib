---
name: uilib-agent-md
description: >
  Author and maintain AGENT.md files in @sybilion/uilib — UI components, widgets,
  and foundation tokens. Use when creating/updating AGENT.md, migrating DocsGuidance,
  or running yarn build:agent-glossary.
---

# uilib AGENT.md authoring

AGENT.md is the single source of truth for **component-centric** guidance (Cursor agents, docs site, uilib glossary). Consumer apps (e.g. app dashboard-spec, reports) define tile→component mappings in their own glossaries — not in uilib AGENT.md.

## File placement

| Doc type                        | Path                                                         |
| ------------------------------- | ------------------------------------------------------------ |
| UI component                    | `src/components/ui/ComponentName/AGENT.md`                   |
| Widget                          | `src/components/widgets/WidgetName/AGENT.md`                 |
| Foundation (Colors, Spacing, …) | `src/docs/agent-guidance/{slug}.md`                          |
| Page layout system              | `src/components/ui/Page/AGENT.md` (special — do not shorten) |

Do **not** add `src/components/widgets/AGENT.md` (authoring-only; lives in this skill).

## Body format (no `# Title` — page header supplies title)

```markdown
Overview paragraph describing what it renders and primary use…

## When to use

- bullet

## When not to use

- bullet

## Do

- bullet

## Don't

- bullet (optional)
```

Compatible with `InteractiveContent variant="full"` in docs.

## Widget format

Same as UI component, plus component-centric binding sections only:

```markdown
## Host provides

- 3–5 bullets: data, callbacks, loading the host must pass

## Requires

- prop names + role

## Empty/loading

- one line on empty and loading behaviour
```

Keep widget files concise (≤ ~25 lines body). Signal for LLM — no noise.

## Optional YAML frontmatter (build only — stripped in docs)

```yaml
---
profiles: [workspace, content]
summary: Short one-line for glossary index
---
```

Default profiles when omitted:

- `widgets/**` and `ui/Page` → `workspace` + `content`
- other `ui/**` → `workspace`
- `src/docs/agent-guidance/**` → `workspace`

## Co-located example files

When a docs page needs a runnable demo, extract it to `{ComponentName}.example.tsx` next to the component (e.g. `src/components/ui/Chart/Chart.example.tsx`).

- Export a named component (e.g. `ChartExample`) from the example file.
- Docs pages import and render it after `<DocsGuidance />`; keep page files to header + guidance + example only.
- **AGENT.md** should link to the example when one exists (path relative to uilib package root, markdown link).
- Example files are for agents and the docs site — not part of the published package API (`index.ts` must not re-export them).

Webpack/babel already include all `src/**/*.tsx` when imported from docs; no extra build config.

## Do not include

- import examples; type/doc links (except co-located `.example.tsx` link when present)
- page-shell boilerplate unrelated to the component
- related-components lists unless choosing between exports
- implementation/styling/keyboard notes unless binding-relevant
- secrets, env vars, API URLs
- inline style examples (`style={{…}}`)

## Build & consumers

```bash
yarn build:agent-glossary --all   # from uilib root
```

Outputs `dist/agent-glossary/`:

- `workspace.index.md` / `content.index.md` — TOC with links (Cursor agent entrypoint)
- `content.prompt.md` — embedded component bodies for content/report LLM prompts (uilib components only)
- `*.generated.ts` — TS exports for app imports

Consumers append tile→component mappings via `AGENT_GLOSSARY_APPEND` at build time (e.g. app dashboard-spec glossary).

## Docs site pattern

```tsx
import guidance from '#uilib/components/ui/Card/AGENT.md';
import { CardExample } from '#uilib/components/ui/Card/Card.example'; // when present

<DocsGuidance source={guidance} />
<CardExample />
```

Webpack loads `*.md` as raw strings; `DocsGuidance` strips frontmatter and renders via `InteractiveContent`.

## Migrating from DocsGuidance props

Extract `overview` → opening paragraph; `whenToUse` / `whenNotToUse` / `doNotes` / `dontNotes` → `##` sections with `-` bullets. Remove inline JSX props from doc pages.
