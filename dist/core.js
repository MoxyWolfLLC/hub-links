/**
 * Shared linking logic used by every adapter. Pipeline-agnostic: it turns a
 * run of text into a sequence of plain-text and link segments, honoring the
 * "first occurrence per term, per document" rule via a shared `linked` set.
 */
import { HUB_LINKS, hrefFor, isExternal } from './map';
/** Elements/contexts we never link inside. */
export const PROTECTED_TAGS = new Set([
    'a',
    'code',
    'pre',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
]);
/**
 * Split `text` into segments, linking each not-yet-linked term's first
 * occurrence. Returns null when nothing in `text` was linked (so callers can
 * cheaply leave the original node untouched).
 *
 * `linked` is shared across an entire document so a term links once total.
 */
export function segmentText(text, linked, site, links = HUB_LINKS) {
    const out = [];
    let cursor = 0;
    let madeLink = false;
    while (cursor < text.length) {
        // earliest match among still-unlinked terms in the remaining text
        let best = null;
        for (const link of links) {
            if (linked.has(link))
                continue;
            const m = link.pattern.exec(text.slice(cursor));
            if (m && (best === null || m.index < best.index)) {
                best = { index: m.index, length: m[0].length, value: m[0], link };
            }
        }
        if (!best)
            break;
        madeLink = true;
        const start = cursor + best.index;
        if (start > cursor)
            out.push({ type: 'text', value: text.slice(cursor, start) });
        out.push({
            type: 'link',
            value: best.value,
            href: hrefFor(best.link, site),
            external: isExternal(best.link, site),
        });
        linked.add(best.link);
        cursor = start + best.length;
    }
    if (!madeLink)
        return null;
    if (cursor < text.length)
        out.push({ type: 'text', value: text.slice(cursor) });
    return out;
}
