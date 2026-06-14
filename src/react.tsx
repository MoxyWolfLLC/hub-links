/**
 * CMS / html-react-parser adapter. For content rendered as a React tree from
 * an HTML string (Payload Lexical->HTML, Directus, etc.).
 *
 *   import { renderHubContent } from '@moxywolf/hub-links/react'
 *   {renderHubContent(post.content, { site: 'assuredbook' })}
 *
 * Pass `linkComponent` (e.g. next/link) to render framework links.
 */
import * as React from 'react'
import parse, {
  type DOMNode,
  type HTMLReactParserOptions,
} from 'html-react-parser'
import { PROTECTED_TAGS, segmentText } from './core'
import type { Site, HubLink } from './map'

type LinkProps = { href: string; rel?: string; children: React.ReactNode }

export function renderHubContent(
  html: string,
  opts: { site: Site; linkComponent?: React.ComponentType<LinkProps> | 'a' },
): React.ReactNode {
  if (!html) return null
  const linked = new Set<HubLink>()
  const Link: any = opts.linkComponent ?? 'a'

  const options: HTMLReactParserOptions = {
    replace: (node: DOMNode) => {
      if (node.type !== 'text') return
      const parent: any = (node as any).parent
      if (parent && parent.type === 'tag' && PROTECTED_TAGS.has(parent.name)) return

      const segs = segmentText((node as any).data, linked, opts.site)
      if (!segs) return

      return (
        <>
          {segs.map((s, i) =>
            s.type === 'text' ? (
              <React.Fragment key={i}>{s.value}</React.Fragment>
            ) : (
              <Link key={i} href={s.href} {...(s.external ? { rel: 'noopener' } : {})}>
                {s.value}
              </Link>
            ),
          )}
        </>
      )
    },
  }

  return parse(html, options)
}
