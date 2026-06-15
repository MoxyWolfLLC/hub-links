/**
 * The cross-property hub-and-spoke link map — the single source of truth.
 *
 * Each entry keys a pillar term to the property that *owns* it, with an
 * absolute URL. Adapters are told which site they are running on, so they emit
 * a relative link on the owning property and an absolute cross-property link
 * everywhere else.
 *
 * Adding a pillar term = one entry here. Cut a release; the plugin rolls it to
 * every property.
 */
export const SITES = {
    stigviewer: 'https://stigviewer.com',
    frontierfounder: 'https://thefrontierfounder.com',
    prfaq: 'https://prfaq.dev',
    grcschema: 'https://grcschema.org',
    moxywolf: 'https://moxywolf.com',
    assuredbook: 'https://assuredbook.com',
};
export const HUB_LINKS = [
    {
        pattern: /multi-?lensatic(?:\s+methodology)?/i,
        owner: 'stigviewer',
        path: '/methodology',
    },
    {
        pattern: /4-?d(?:\s+ai\s+fluency)?\s+framework/i,
        owner: 'frontierfounder',
        path: '/blog/eating-our-own-dogfood',
    },
    // future pillar terms — one entry each
];
/** Resolve the href for a link given the site currently rendering. */
export function hrefFor(link, currentSite) {
    return link.owner === currentSite ? link.path : SITES[link.owner] + link.path;
}
/** True when the link points off the current property. */
export function isExternal(link, currentSite) {
    return link.owner !== currentSite;
}
