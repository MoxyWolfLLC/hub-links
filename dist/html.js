/**
 * html-string adapter. For pipelines that emit an HTML *string* with no AST
 * (e.g. `marked`). Tag-aware: it tracks an open-element stack so it never
 * links inside <a>, <code>, <pre>, or headings, and never inside a tag itself.
 *
 *   import { linkifyHtml } from '@moxywolf/hub-links/html'
 *   const html = linkifyHtml(marked(md), { site: 'moxywolf' })
 */
import { PROTECTED_TAGS, segmentText } from './core';
const TAG = /<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>/g;
function escapeAttr(s) {
    return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}
function segmentsToHtml(segs) {
    return segs
        .map((s) => s.type === 'text'
        ? s.value
        : `<a href="${escapeAttr(s.href)}"${s.external ? ' rel="noopener"' : ''}>${s.value}</a>`)
        .join('');
}
export function linkifyHtml(html, opts) {
    if (!html)
        return html;
    const linked = new Set();
    const protectedStack = [];
    let out = '';
    let last = 0;
    let m;
    TAG.lastIndex = 0;
    while ((m = TAG.exec(html)) !== null) {
        // text span between the previous tag and this one
        const textSpan = html.slice(last, m.index);
        if (textSpan) {
            if (protectedStack.length === 0) {
                const segs = segmentText(textSpan, linked, opts.site);
                out += segs ? segmentsToHtml(segs) : textSpan;
            }
            else {
                out += textSpan;
            }
        }
        const tag = m[0];
        const name = m[1].toLowerCase();
        const isClose = tag[1] === '/';
        if (PROTECTED_TAGS.has(name)) {
            if (isClose) {
                const i = protectedStack.lastIndexOf(name);
                if (i !== -1)
                    protectedStack.splice(i, 1);
            }
            else if (!/\/>$/.test(tag)) {
                protectedStack.push(name);
            }
        }
        out += tag;
        last = TAG.lastIndex;
    }
    // trailing text after the last tag
    const tail = html.slice(last);
    if (tail) {
        if (protectedStack.length === 0) {
            const segs = segmentText(tail, linked, opts.site);
            out += segs ? segmentsToHtml(segs) : tail;
        }
        else {
            out += tail;
        }
    }
    return out;
}
