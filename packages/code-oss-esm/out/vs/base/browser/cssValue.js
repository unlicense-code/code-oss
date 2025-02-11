import { FileAccess } from '../common/network.js';
function asFragment(raw) {
    return raw;
}
export function asCssValueWithDefault(cssPropertyValue, dflt) {
    if (cssPropertyValue !== undefined) {
        const variableMatch = cssPropertyValue.match(/^\s*var\((.+)\)$/);
        if (variableMatch) {
            const varArguments = variableMatch[1].split(',', 2);
            if (varArguments.length === 2) {
                dflt = asCssValueWithDefault(varArguments[1].trim(), dflt);
            }
            return `var(${varArguments[0]}, ${dflt})`;
        }
        return cssPropertyValue;
    }
    return dflt;
}
export function sizeValue(value) {
    const out = value.replaceAll(/[^\w.%+-]/gi, '');
    if (out !== value) {
        console.warn(`CSS size ${value} modified to ${out} to be safe for CSS`);
    }
    return asFragment(out);
}
export function hexColorValue(value) {
    const out = value.replaceAll(/[^[0-9a-fA-F#]]/gi, '');
    if (out !== value) {
        console.warn(`CSS hex color ${value} modified to ${out} to be safe for CSS`);
    }
    return asFragment(out);
}
export function identValue(value) {
    const out = value.replaceAll(/[^_\-a-z0-9]/gi, '');
    if (out !== value) {
        console.warn(`CSS ident value ${value} modified to ${out} to be safe for CSS`);
    }
    return asFragment(out);
}
export function stringValue(value) {
    return asFragment(`'${value.replaceAll(/'/g, '\\000027')}'`);
}
/**
 * returns url('...')
 */
export function asCSSUrl(uri) {
    if (!uri) {
        return asFragment(`url('')`);
    }
    return inline `url(${stringValue(FileAccess.uriToBrowserUri(uri).toString(true))})`;
}
export function className(value) {
    const out = CSS.escape(value);
    if (out !== value) {
        console.warn(`CSS class name ${value} modified to ${out} to be safe for CSS`);
    }
    return asFragment(out);
}
/**
 * Template string tag that that constructs a CSS fragment.
 *
 * All expressions in the template must be css safe values.
 */
export function inline(strings, ...values) {
    return asFragment(strings.reduce((result, str, i) => {
        const value = values[i] || '';
        return result + str + value;
    }, ''));
}
export class Builder {
    constructor() {
        this._parts = [];
    }
    push(...parts) {
        this._parts.push(...parts);
    }
    join(joiner = '\n') {
        return asFragment(this._parts.join(joiner));
    }
}
