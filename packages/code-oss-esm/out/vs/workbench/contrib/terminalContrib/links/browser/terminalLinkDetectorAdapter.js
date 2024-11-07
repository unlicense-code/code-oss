/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { Emitter } from '../../../../../base/common/event.js';
import { Disposable } from '../../../../../base/common/lifecycle.js';
import { localize } from '../../../../../nls.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import { TerminalLink } from './terminalLink.js';
/**
 * Wrap a link detector object so it can be used in xterm.js
 */
let TerminalLinkDetectorAdapter = class TerminalLinkDetectorAdapter extends Disposable {
    constructor(_detector, _instantiationService) {
        super();
        this._detector = _detector;
        this._instantiationService = _instantiationService;
        this._onDidActivateLink = this._register(new Emitter());
        this.onDidActivateLink = this._onDidActivateLink.event;
        this._onDidShowHover = this._register(new Emitter());
        this.onDidShowHover = this._onDidShowHover.event;
        this._activeProvideLinkRequests = new Map();
    }
    async provideLinks(bufferLineNumber, callback) {
        let activeRequest = this._activeProvideLinkRequests.get(bufferLineNumber);
        if (activeRequest) {
            await activeRequest;
            callback(this._activeLinks);
            return;
        }
        if (this._activeLinks) {
            for (const link of this._activeLinks) {
                link.dispose();
            }
        }
        activeRequest = this._provideLinks(bufferLineNumber);
        this._activeProvideLinkRequests.set(bufferLineNumber, activeRequest);
        this._activeLinks = await activeRequest;
        this._activeProvideLinkRequests.delete(bufferLineNumber);
        callback(this._activeLinks);
    }
    async _provideLinks(bufferLineNumber) {
        // Dispose of all old links if new links are provided, links are only cached for the current line
        const links = [];
        let startLine = bufferLineNumber - 1;
        let endLine = startLine;
        const lines = [
            this._detector.xterm.buffer.active.getLine(startLine)
        ];
        // Cap the maximum context on either side of the line being provided, by taking the context
        // around the line being provided for this ensures the line the pointer is on will have
        // links provided.
        const maxCharacterContext = Math.max(this._detector.maxLinkLength, this._detector.xterm.cols);
        const maxLineContext = Math.ceil(maxCharacterContext / this._detector.xterm.cols);
        const minStartLine = Math.max(startLine - maxLineContext, 0);
        const maxEndLine = Math.min(endLine + maxLineContext, this._detector.xterm.buffer.active.length);
        while (startLine >= minStartLine && this._detector.xterm.buffer.active.getLine(startLine)?.isWrapped) {
            lines.unshift(this._detector.xterm.buffer.active.getLine(startLine - 1));
            startLine--;
        }
        while (endLine < maxEndLine && this._detector.xterm.buffer.active.getLine(endLine + 1)?.isWrapped) {
            lines.push(this._detector.xterm.buffer.active.getLine(endLine + 1));
            endLine++;
        }
        const detectedLinks = await this._detector.detect(lines, startLine, endLine);
        for (const link of detectedLinks) {
            links.push(this._createTerminalLink(link, async (event) => this._onDidActivateLink.fire({ link, event })));
        }
        return links;
    }
    _createTerminalLink(l, activateCallback) {
        // Remove trailing colon if there is one so the link is more useful
        if (!l.disableTrimColon && l.text.length > 0 && l.text.charAt(l.text.length - 1) === ':') {
            l.text = l.text.slice(0, -1);
            l.bufferRange.end.x--;
        }
        return this._instantiationService.createInstance(TerminalLink, this._detector.xterm, l.bufferRange, l.text, l.uri, l.parsedLink, l.actions, this._detector.xterm.buffer.active.viewportY, activateCallback, (link, viewportRange, modifierDownCallback, modifierUpCallback) => this._onDidShowHover.fire({
            link,
            viewportRange,
            modifierDownCallback,
            modifierUpCallback
        }), l.type !== "Search" /* TerminalBuiltinLinkType.Search */, // Only search is low confidence
        l.label || this._getLabel(l.type), l.type);
    }
    _getLabel(type) {
        switch (type) {
            case "Search" /* TerminalBuiltinLinkType.Search */: return localize('searchWorkspace', 'Search workspace');
            case "LocalFile" /* TerminalBuiltinLinkType.LocalFile */: return localize('openFile', 'Open file in editor');
            case "LocalFolderInWorkspace" /* TerminalBuiltinLinkType.LocalFolderInWorkspace */: return localize('focusFolder', 'Focus folder in explorer');
            case "LocalFolderOutsideWorkspace" /* TerminalBuiltinLinkType.LocalFolderOutsideWorkspace */: return localize('openFolder', 'Open folder in new window');
            case "Url" /* TerminalBuiltinLinkType.Url */:
            default:
                return localize('followLink', 'Follow link');
        }
    }
};
TerminalLinkDetectorAdapter = __decorate([
    __param(1, IInstantiationService)
], TerminalLinkDetectorAdapter);
export { TerminalLinkDetectorAdapter };
