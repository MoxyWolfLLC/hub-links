import { test } from 'node:test'
import assert from 'node:assert/strict'
import { renderToStaticMarkup } from 'react-dom/server'

import { HUB_LINKS, hrefFor, segmentText, type HubLink } from '../src/index'
import { rehypeHubLinks } from '../src/rehype'
import { remarkHubLinks } from '../src/remark'
import { linkifyHtml } from '../src/html'
import { renderHubContent } from '../src/react'

// Two-term fixture for multi-term / ownership tests
const FIXTURE: HubLink[] = [
  { pattern: /multi-?lensatic(?:\s+methodology)?/i, owner: 'stigviewer', path: '/methodology' },
  { pattern: /lens test/i, owner: 'stigviewer', path: '/lens-test' },
]

// ---- map ----
test('hrefFor: relative on owner, absolute cross-property', () => {
  const link = HUB_LINKS[0]
  assert.equal(hrefFor(link, 'stigviewer'), '/methodology')
  assert.equal(hrefFor(link, 'moxywolf'), 'https://stigviewer.com/methodology')
})

// ---- segmentText ----
test('segmentText: links first occurrence, leaves the second plain', () => {
  const linked = new Set()
  const segs = segmentText(
    'A multi-lensatic methodology. Again multi-lensatic methodology.',
    linked,
    'stigviewer',
  )
  assert.ok(segs)
  const links = segs!.filter((s) => s.type === 'link')
  assert.equal(links.length, 1)
  assert.equal(links[0].value.toLowerCase(), 'multi-lensatic methodology')
})

test('segmentText: case-insensitive + longest form', () => {
  const linked = new Set()
  const segs = segmentText('See MULTI-LENSATIC METHODOLOGY here', linked, 'moxywolf')
  const link = segs!.find((s) => s.type === 'link') as any
  assert.equal(link.value, 'MULTI-LENSATIC METHODOLOGY')
  assert.equal(link.external, true)
  assert.equal(link.href, 'https://stigviewer.com/methodology')
})

test('segmentText: two distinct terms both link once', () => {
  const linked = new Set()
  const segs = segmentText(
    'the multi-lensatic methodology and the lens test together',
    linked,
    'stigviewer',
    FIXTURE,
  )
  const links = segs!.filter((s) => s.type === 'link')
  assert.equal(links.length, 2)
})

test('segmentText: returns null when no term present', () => {
  assert.equal(segmentText('nothing to see here', new Set(), 'stigviewer'), null)
})

// ---- html-string adapter ----
test('linkifyHtml: links inside a paragraph', () => {
  const out = linkifyHtml('<p>The multi-lensatic methodology rocks.</p>', { site: 'moxywolf' })
  assert.match(out, /<a href="https:\/\/stigviewer\.com\/methodology" rel="noopener">multi-lensatic methodology<\/a>/)
})

test('linkifyHtml: same-property link is relative, no rel', () => {
  const out = linkifyHtml('<p>the multi-lensatic methodology</p>', { site: 'stigviewer' })
  assert.match(out, /<a href="\/methodology">multi-lensatic methodology<\/a>/)
  assert.doesNotMatch(out, /rel="noopener"/)
})

test('linkifyHtml: skips inside <code> and <a>', () => {
  const code = linkifyHtml('<p><code>multi-lensatic methodology</code></p>', { site: 'moxywolf' })
  assert.doesNotMatch(code, /<a /)
  const anchor = linkifyHtml('<p><a href="/x">multi-lensatic methodology</a></p>', { site: 'moxywolf' })
  // the only anchor is the pre-existing one
  assert.equal((anchor.match(/<a /g) || []).length, 1)
})

test('linkifyHtml: skips inside headings', () => {
  const out = linkifyHtml('<h2>multi-lensatic methodology</h2>', { site: 'moxywolf' })
  assert.doesNotMatch(out, /<a /)
})

test('linkifyHtml: only the first mention links', () => {
  const out = linkifyHtml(
    '<p>multi-lensatic methodology</p><p>multi-lensatic methodology</p>',
    { site: 'moxywolf' },
  )
  assert.equal((out.match(/<a /g) || []).length, 1)
})

// ---- rehype adapter ----
function hastParagraph(value: string, tag = 'p') {
  return {
    type: 'root',
    children: [{ type: 'element', tagName: tag, properties: {}, children: [{ type: 'text', value }] }],
  }
}

test('rehypeHubLinks: inserts an anchor element', () => {
  const tree: any = hastParagraph('read the multi-lensatic methodology now')
  rehypeHubLinks({ site: 'frontierfounder' })(tree)
  const p = tree.children[0]
  const anchor = p.children.find((c: any) => c.tagName === 'a')
  assert.ok(anchor, 'anchor inserted')
  assert.equal(anchor.properties.href, 'https://stigviewer.com/methodology')
  assert.equal(anchor.properties.rel, 'noopener')
})

test('rehypeHubLinks: skips protected parent (code)', () => {
  const tree: any = hastParagraph('multi-lensatic methodology', 'code')
  rehypeHubLinks({ site: 'frontierfounder' })(tree)
  const code = tree.children[0]
  assert.ok(!code.children.some((c: any) => c.tagName === 'a'))
})

// ---- remark adapter ----
test('remarkHubLinks: inserts a link node, skips headings', () => {
  const para: any = {
    type: 'root',
    children: [{ type: 'paragraph', children: [{ type: 'text', value: 'a multi-lensatic methodology here' }] }],
  }
  remarkHubLinks({ site: 'grcschema' })(para)
  const link = para.children[0].children.find((c: any) => c.type === 'link')
  assert.ok(link)
  assert.equal(link.url, 'https://stigviewer.com/methodology')

  const heading: any = {
    type: 'root',
    children: [{ type: 'heading', depth: 2, children: [{ type: 'text', value: 'multi-lensatic methodology' }] }],
  }
  remarkHubLinks({ site: 'grcschema' })(heading)
  assert.ok(!heading.children[0].children.some((c: any) => c.type === 'link'))
})

// ---- react / html-react-parser adapter ----
test('renderHubContent: produces an anchor in the React output', () => {
  const node = renderHubContent('<p>the multi-lensatic methodology is here</p>', { site: 'assuredbook' })
  const html = renderToStaticMarkup(node as any)
  assert.match(html, /<a [^>]*href="https:\/\/stigviewer\.com\/methodology"/)
  assert.match(html, />multi-lensatic methodology</)
})

test('renderHubContent: skips inside code', () => {
  const node = renderHubContent('<p><code>multi-lensatic methodology</code></p>', { site: 'assuredbook' })
  const html = renderToStaticMarkup(node as any)
  assert.doesNotMatch(html, /<a /)
})
