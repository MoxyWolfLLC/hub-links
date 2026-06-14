/**
 * remark adapter (MDAST). For pipelines that go markdown -> remark -> HTML
 * (e.g. remark-html). Place BEFORE the HTML serializer.
 *   import { remarkHubLinks } from '@moxywolf/hub-links/remark'
 *   .use(remarkHubLinks, { site: 'grcschema' })
 */
import { visit } from 'unist-util-visit'
import { segmentText } from './core'
import type { Site, HubLink } from './map'

// In MDAST, headings/links own their text directly; inline/block code carry
// their value on the node (no text children), so they're skipped implicitly.
const SKIP_PARENTS = new Set(['heading', 'link'])

export function remarkHubLinks(opts: { site: Site }) {
  return (tree: any) => {
    const linked = new Set<HubLink>()
    visit(tree, 'text', (node: any, index: number | undefined, parent: any) => {
      if (parent == null || index == null) return
      if (SKIP_PARENTS.has(parent.type)) return

      const segs = segmentText(node.value, linked, opts.site)
      if (!segs) return

      const nodes = segs.map((s) =>
        s.type === 'text'
          ? { type: 'text', value: s.value }
          : {
              type: 'link',
              url: s.href,
              ...(s.external
                ? { data: { hProperties: { rel: 'noopener' } } }
                : {}),
              children: [{ type: 'text', value: s.value }],
            },
      )

      parent.children.splice(index, 1, ...nodes)
      return index + nodes.length
    })
  }
}
