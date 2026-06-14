/**
 * rehype adapter (HAST). For @next/mdx and react-markdown (rehypePlugins).
 *   import { rehypeHubLinks } from '@moxywolf/hub-links/rehype'
 *   rehypePlugins: [[rehypeHubLinks, { site: 'stigviewer' }]]
 */
import { visit } from 'unist-util-visit'
import { PROTECTED_TAGS, segmentText } from './core'
import type { Site, HubLink } from './map'

export function rehypeHubLinks(opts: { site: Site }) {
  return (tree: any) => {
    const linked = new Set<HubLink>()
    visit(tree, 'text', (node: any, index: number | undefined, parent: any) => {
      if (parent == null || index == null) return
      if (parent.type === 'element' && PROTECTED_TAGS.has(parent.tagName)) return

      const segs = segmentText(node.value, linked, opts.site)
      if (!segs) return

      const nodes = segs.map((s) =>
        s.type === 'text'
          ? { type: 'text', value: s.value }
          : {
              type: 'element',
              tagName: 'a',
              properties: {
                href: s.href,
                ...(s.external ? { rel: 'noopener' } : {}),
              },
              children: [{ type: 'text', value: s.value }],
            },
      )

      parent.children.splice(index, 1, ...nodes)
      // resume past the nodes we just inserted (don't re-scan the new anchor)
      return index + nodes.length
    })
  }
}
