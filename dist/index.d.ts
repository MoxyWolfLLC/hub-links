/**
 * @moxywolf/hub-links — the cross-property hub-and-spoke link map.
 *
 * The root entry exports the map and pure helpers only (zero runtime deps).
 * Import an adapter from its subpath so you only pull the deps it needs:
 *   '@moxywolf/hub-links/rehype'  -> unist-util-visit
 *   '@moxywolf/hub-links/remark'  -> unist-util-visit
 *   '@moxywolf/hub-links/html'    -> (none)
 *   '@moxywolf/hub-links/react'   -> html-react-parser, react
 */
export { SITES, HUB_LINKS, hrefFor, isExternal, type Site, type HubLink, } from './map';
export { PROTECTED_TAGS, segmentText, type Segment } from './core';
