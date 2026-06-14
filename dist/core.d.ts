/**
 * Shared linking logic used by every adapter. Pipeline-agnostic: it turns a
 * run of text into a sequence of plain-text and link segments, honoring the
 * "first occurrence per term, per document" rule via a shared `linked` set.
 */
import { type HubLink, type Site } from './map.js';
/** Elements/contexts we never link inside. */
export declare const PROTECTED_TAGS: Set<string>;
export type Segment = {
    type: 'text';
    value: string;
} | {
    type: 'link';
    value: string;
    href: string;
    external: boolean;
};
/**
 * Split `text` into segments, linking each not-yet-linked term's first
 * occurrence. Returns null when nothing in `text` was linked (so callers can
 * cheaply leave the original node untouched).
 *
 * `linked` is shared across an entire document so a term links once total.
 */
export declare function segmentText(text: string, linked: Set<HubLink>, site: Site, links?: HubLink[]): Segment[] | null;
