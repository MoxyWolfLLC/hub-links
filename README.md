# @moxywolf/hub-links

Cross-property hub-and-spoke auto-linking for the MoxyWolf blogs. One link map, four pipeline adapters. When a post mentions a pillar term (e.g. "multi-lensatic methodology"), the **first** mention auto-links to that term's canonical page — relative on the owning property, absolute cross-property everywhere else. No CMS required; no author hand-linking.

See `DR-079` for the full rationale.

## The map is the only thing you edit

`src/map.ts` is the source of truth. Add a pillar term = one entry:

```ts
export const HUB_LINKS: HubLink[] = [
  { pattern: /multi-?lensatic(?:\s+methodology)?/i, owner: 'stigviewer', path: '/methodology' },
  // add more here
]
```

`pattern` is a case-insensitive, **non-global** regex (list longest/most-specific first). `owner` is the property slug that owns the page; `path` is the page path on that owner. Cut a release and the plugin rolls it to every property.

## Pick the adapter that matches your blog's pipeline

| Your renderer | Import | Wire it |
|---|---|---|
| `@next/mdx`, `react-markdown` (rehypePlugins) | `@moxywolf/hub-links/rehype` | add `[rehypeHubLinks, { site }]` to `rehypePlugins` |
| `remark` → `remark-html` | `@moxywolf/hub-links/remark` | `.use(remarkHubLinks, { site })` before the HTML serializer |
| `marked` / any HTML **string** | `@moxywolf/hub-links/html` | `linkifyHtml(htmlString, { site })` |
| Payload / Directus / HTML rendered to React | `@moxywolf/hub-links/react` | `renderHubContent(post.content, { site })` |

`site` is one of the slugs in `SITES` (`stigviewer`, `frontierfounder`, `prfaq`, `grcschema`, `moxywolf`, `assuredbook`).

### Examples

```ts
// rehype — stigviewer (apps/web MDX config, apps/docs/src/mdx/rehype.mjs), FrontierFounder, prfaq
import { rehypeHubLinks } from '@moxywolf/hub-links/rehype'
export const rehypePlugins = [[rehypeHubLinks, { site: 'stigviewer' }]]
```

```ts
// remark — grcschema-website
import { remarkHubLinks } from '@moxywolf/hub-links/remark'
const html = await remark().use(remarkHubLinks, { site: 'grcschema' }).use(remarkHtml).process(md)
```

```ts
// html string — moxywolf-website (marked)
import { linkifyHtml } from '@moxywolf/hub-links/html'
const html = linkifyHtml(marked.parse(md), { site: 'moxywolf' })
```

```tsx
// react / CMS — assured-book-js (Payload: serialize Lexical→HTML first)
import { renderHubContent } from '@moxywolf/hub-links/react'
import Link from 'next/link'
<div>{renderHubContent(post.content, { site: 'assuredbook', linkComponent: Link })}</div>
```

## Linking rules (every adapter)

- First occurrence per term, per document (a term links once).
- Never links inside `<a>`, `code`/`pre`, or headings.
- Same-property → relative path; cross-property → absolute URL + `rel="noopener"`.

## Develop

```
npm install
npm test        # node:test via tsx — 15 cases across all four adapters
npm run build   # tsc -> dist/
```

Root entry (`@moxywolf/hub-links`) exports the map + pure helpers with zero runtime deps. Each adapter is a subpath so a repo only pulls the deps it uses (`unist-util-visit` for rehype/remark; `html-react-parser` + `react` for react; none for html).
