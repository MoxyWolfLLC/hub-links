/**
 * CMS / html-react-parser adapter. For content rendered as a React tree from
 * an HTML string (Payload Lexical->HTML, Directus, etc.).
 *
 *   import { renderHubContent } from '@moxywolf/hub-links/react'
 *   {renderHubContent(post.content, { site: 'assuredbook' })}
 *
 * Pass `linkComponent` (e.g. next/link) to render framework links.
 */
import * as React from 'react';
import type { Site } from './map';
type LinkProps = {
    href: string;
    rel?: string;
    children: React.ReactNode;
};
export declare function renderHubContent(html: string, opts: {
    site: Site;
    linkComponent?: React.ComponentType<LinkProps> | 'a';
}): React.ReactNode;
export {};
