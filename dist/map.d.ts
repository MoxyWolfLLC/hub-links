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
export declare const SITES: {
    readonly stigviewer: "https://stigviewer.com";
    readonly frontierfounder: "https://thefrontierfounder.com";
    readonly prfaq: "https://prfaq.dev";
    readonly grcschema: "https://grcschema.org";
    readonly moxywolf: "https://moxywolf.com";
    readonly assuredbook: "https://assuredbook.com";
};
export type Site = keyof typeof SITES;
export type HubLink = {
    /** Case-insensitive, NON-global regex. List longest/most-specific first. */
    pattern: RegExp;
    /** Property slug that owns the term. */
    owner: Site;
    /** Path on the owner, e.g. '/methodology'. */
    path: string;
};
export declare const HUB_LINKS: HubLink[];
/** Resolve the href for a link given the site currently rendering. */
export declare function hrefFor(link: HubLink, currentSite: Site): string;
/** True when the link points off the current property. */
export declare function isExternal(link: HubLink, currentSite: Site): boolean;
