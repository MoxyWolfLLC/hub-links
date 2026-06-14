import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
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
import parse from 'html-react-parser';
import { PROTECTED_TAGS, segmentText } from './core.js';
export function renderHubContent(html, opts) {
    if (!html)
        return null;
    const linked = new Set();
    const Link = opts.linkComponent ?? 'a';
    const options = {
        replace: (node) => {
            if (node.type !== 'text')
                return;
            const parent = node.parent;
            if (parent && parent.type === 'tag' && PROTECTED_TAGS.has(parent.name))
                return;
            const segs = segmentText(node.data, linked, opts.site);
            if (!segs)
                return;
            return (_jsx(_Fragment, { children: segs.map((s, i) => s.type === 'text' ? (_jsx(React.Fragment, { children: s.value }, i)) : (_jsx(Link, { href: s.href, ...(s.external ? { rel: 'noopener' } : {}), children: s.value }, i))) }));
        },
    };
    return parse(html, options);
}
