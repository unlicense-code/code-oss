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
var SuggestAddon_1;
import * as dom from '../../../../../base/browser/dom.js';
import { Codicon } from '../../../../../base/common/codicons.js';
import { Emitter, Event } from '../../../../../base/common/event.js';
import { combinedDisposable, Disposable, MutableDisposable } from '../../../../../base/common/lifecycle.js';
import { sep } from '../../../../../base/common/path.js';
import { commonPrefixLength } from '../../../../../base/common/strings.js';
import { editorSuggestWidgetSelectedBackground } from '../../../../../editor/contrib/suggest/browser/suggestWidget.js';
import { IConfigurationService } from '../../../../../platform/configuration/common/configuration.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import { IStorageService } from '../../../../../platform/storage/common/storage.js';
import { getListStyles } from '../../../../../platform/theme/browser/defaultStyles.js';
import { activeContrastBorder } from '../../../../../platform/theme/common/colorRegistry.js';
import { ITerminalConfigurationService } from '../../../terminal/browser/terminal.js';
import { terminalSuggestConfigSection } from '../common/terminalSuggestConfiguration.js';
import { SimpleCompletionItem } from '../../../../services/suggest/browser/simpleCompletionItem.js';
import { LineContext, SimpleCompletionModel } from '../../../../services/suggest/browser/simpleCompletionModel.js';
import { SimpleSuggestWidget } from '../../../../services/suggest/browser/simpleSuggestWidget.js';
import { ITerminalCompletionService } from './terminalCompletionService.js';
import { CancellationTokenSource } from '../../../../../base/common/cancellation.js';
let SuggestAddon = class SuggestAddon extends Disposable {
    static { SuggestAddon_1 = this; }
    static { this.lastAcceptedCompletionTimestamp = 0; }
    constructor(_shellType, _capabilities, _terminalSuggestWidgetVisibleContextKey, _terminalCompletionService, _configurationService, _instantiationService, _terminalConfigurationService) {
        super();
        this._shellType = _shellType;
        this._capabilities = _capabilities;
        this._terminalSuggestWidgetVisibleContextKey = _terminalSuggestWidgetVisibleContextKey;
        this._terminalCompletionService = _terminalCompletionService;
        this._configurationService = _configurationService;
        this._instantiationService = _instantiationService;
        this._terminalConfigurationService = _terminalConfigurationService;
        this._promptInputModelSubscriptions = this._register(new MutableDisposable());
        this._enableWidget = true;
        this._pathSeparator = sep;
        this._isFilteringDirectories = false;
        this._cursorIndexDelta = 0;
        this._requestedCompletionsIndex = 0;
        this._providerReplacementIndex = 0;
        this.isPasting = false;
        this._onBell = this._register(new Emitter());
        this.onBell = this._onBell.event;
        this._onAcceptedCompletion = this._register(new Emitter());
        this.onAcceptedCompletion = this._onAcceptedCompletion.event;
        this._onDidReceiveCompletions = this._register(new Emitter());
        this.onDidReceiveCompletions = this._onDidReceiveCompletions.event;
        this._register(Event.runAndSubscribe(Event.any(this._capabilities.onDidAddCapabilityType, this._capabilities.onDidRemoveCapabilityType), () => {
            const commandDetection = this._capabilities.get(2 /* TerminalCapability.CommandDetection */);
            if (commandDetection) {
                if (this._promptInputModel !== commandDetection.promptInputModel) {
                    this._promptInputModel = commandDetection.promptInputModel;
                    this._promptInputModelSubscriptions.value = combinedDisposable(this._promptInputModel.onDidChangeInput(e => this._sync(e)), this._promptInputModel.onDidFinishInput(() => this.hideSuggestWidget()));
                }
            }
            else {
                this._promptInputModel = undefined;
            }
        }));
    }
    activate(xterm) {
        this._terminal = xterm;
        this._register(xterm.onData(async (e) => {
            this._lastUserData = e;
        }));
    }
    async _handleCompletionProviders(terminal, token) {
        // Nothing to handle if the terminal is not attached
        if (!terminal?.element || !this._enableWidget || !this._promptInputModel) {
            return;
        }
        // Only show the suggest widget if the terminal is focused
        if (!dom.isAncestorOfActiveElement(terminal.element)) {
            return;
        }
        if (!this._shellType) {
            return;
        }
        this._requestedCompletionsIndex = this._promptInputModel.cursorIndex;
        const providedCompletions = await this._terminalCompletionService.provideCompletions(this._promptInputModel.value, this._promptInputModel.cursorIndex, this._shellType);
        if (!providedCompletions?.length || token.isCancellationRequested) {
            return;
        }
        this._onDidReceiveCompletions.fire();
        const replacementIndices = [...new Set(providedCompletions.filter(p => p.replacementIndex !== undefined).map(c => c.replacementIndex))].sort();
        // this is of length 1 because all extension providers should have the same replacement index, so we just take the last one
        const replacementIndex = replacementIndices.length > 0 ? replacementIndices[replacementIndices.length - 1] : 0;
        this._providerReplacementIndex = replacementIndex;
        this._currentPromptInputState = {
            value: this._promptInputModel.value,
            prefix: this._promptInputModel.prefix,
            suffix: this._promptInputModel.suffix,
            cursorIndex: this._promptInputModel.cursorIndex,
            ghostTextIndex: this._promptInputModel.ghostTextIndex
        };
        this._leadingLineContent = this._currentPromptInputState.prefix.substring(replacementIndex, replacementIndex + this._promptInputModel.cursorIndex + this._cursorIndexDelta);
        const completions = providedCompletions.flat();
        if (!completions?.length) {
            return;
        }
        const firstChar = this._leadingLineContent.length === 0 ? '' : this._leadingLineContent[0];
        // This is a TabExpansion2 result
        if (this._leadingLineContent.includes(' ') || firstChar === '[') {
            this._leadingLineContent = this._promptInputModel.prefix;
        }
        if (this._mostRecentCompletion?.isDirectory && completions.every(e => e.isDirectory)) {
            completions.push(this._mostRecentCompletion);
        }
        this._mostRecentCompletion = undefined;
        this._cursorIndexDelta = this._currentPromptInputState.cursorIndex - this._requestedCompletionsIndex;
        let normalizedLeadingLineContent = this._leadingLineContent;
        // If there is a single directory in the completions:
        // - `\` and `/` are normalized such that either can be used
        // - Using `\` or `/` will request new completions. It's important that this only occurs
        //   when a directory is present, if not completions like git branches could be requested
        //   which leads to flickering
        this._isFilteringDirectories = completions.some(e => e.isDirectory);
        if (this._isFilteringDirectories) {
            const firstDir = completions.find(e => e.isDirectory);
            this._pathSeparator = firstDir?.label.match(/(?<sep>[\\\/])/)?.groups?.sep ?? sep;
            normalizedLeadingLineContent = normalizePathSeparator(normalizedLeadingLineContent, this._pathSeparator);
        }
        const lineContext = new LineContext(normalizedLeadingLineContent, this._cursorIndexDelta);
        const model = new SimpleCompletionModel(completions.filter(c => !!c.label).map(c => new SimpleCompletionItem(c)), lineContext);
        if (token.isCancellationRequested) {
            return;
        }
        this._showCompletions(model);
    }
    setContainerWithOverflow(container) {
        this._container = container;
    }
    setScreen(screen) {
        this._screen = screen;
    }
    async requestCompletions() {
        if (!this._promptInputModel) {
            return;
        }
        if (this.isPasting) {
            return;
        }
        if (this._cancellationTokenSource) {
            this._cancellationTokenSource.cancel();
            this._cancellationTokenSource.dispose();
        }
        this._cancellationTokenSource = new CancellationTokenSource();
        const token = this._cancellationTokenSource.token;
        await this._handleCompletionProviders(this._terminal, token);
    }
    _sync(promptInputState) {
        const config = this._configurationService.getValue(terminalSuggestConfigSection);
        if (!this._mostRecentPromptInputState || promptInputState.cursorIndex > this._mostRecentPromptInputState.cursorIndex) {
            // If input has been added
            let sent = false;
            // Quick suggestions
            if (!this._terminalSuggestWidgetVisibleContextKey.get()) {
                if (config.quickSuggestions) {
                    // TODO: Make the regex code generic
                    // TODO: Don't use `\[` in bash/zsh
                    // If first character or first character after a space (or `[` in pwsh), request completions
                    if (promptInputState.cursorIndex === 1 || promptInputState.prefix.match(/([\s\[])[^\s]$/)) {
                        // Never request completions if the last key sequence was up or down as the user was likely
                        // navigating history
                        if (!this._lastUserData?.match(/^\x1b[\[O]?[A-D]$/)) {
                            this.requestCompletions();
                            sent = true;
                        }
                    }
                }
            }
            // Trigger characters - this happens even if the widget is showing
            if (config.suggestOnTriggerCharacters && !sent) {
                const prefix = promptInputState.prefix;
                if (
                // Only trigger on `-` if it's after a space. This is required to not clear
                // completions when typing the `-` in `git cherry-pick`
                prefix?.match(/\s[\-]$/) ||
                    // Only trigger on `\` and `/` if it's a directory. Not doing so causes problems
                    // with git branches in particular
                    this._isFilteringDirectories && prefix?.match(/[\\\/]$/)) {
                    this.requestCompletions();
                    sent = true;
                }
                // TODO: eventually add an appropriate trigger char check for other shells
            }
        }
        this._mostRecentPromptInputState = promptInputState;
        if (!this._promptInputModel || !this._terminal || !this._suggestWidget || this._leadingLineContent === undefined) {
            return;
        }
        this._currentPromptInputState = promptInputState;
        // Hide the widget if the latest character was a space
        if (this._currentPromptInputState.cursorIndex > 1 && this._currentPromptInputState.value.at(this._currentPromptInputState.cursorIndex - 1) === ' ') {
            this.hideSuggestWidget();
            return;
        }
        // Hide the widget if the cursor moves to the left of the initial position as the
        // completions are no longer valid
        // to do: get replacement length to be correct, readd this?
        if (this._currentPromptInputState && this._currentPromptInputState.cursorIndex < this._leadingLineContent.length) {
            this.hideSuggestWidget();
            return;
        }
        if (this._terminalSuggestWidgetVisibleContextKey.get()) {
            this._cursorIndexDelta = this._currentPromptInputState.cursorIndex - (this._requestedCompletionsIndex);
            let normalizedLeadingLineContent = this._currentPromptInputState.value.substring(this._providerReplacementIndex, this._requestedCompletionsIndex + this._cursorIndexDelta);
            if (this._isFilteringDirectories) {
                normalizedLeadingLineContent = normalizePathSeparator(normalizedLeadingLineContent, this._pathSeparator);
            }
            const lineContext = new LineContext(normalizedLeadingLineContent, this._cursorIndexDelta);
            this._suggestWidget.setLineContext(lineContext);
        }
        // Hide and clear model if there are no more items
        if (!this._suggestWidget.hasCompletions()) {
            this.hideSuggestWidget();
            return;
        }
        const dimensions = this._getTerminalDimensions();
        if (!dimensions.width || !dimensions.height) {
            return;
        }
        const xtermBox = this._screen.getBoundingClientRect();
        this._suggestWidget.showSuggestions(0, false, false, {
            left: xtermBox.left + this._terminal.buffer.active.cursorX * dimensions.width,
            top: xtermBox.top + this._terminal.buffer.active.cursorY * dimensions.height,
            height: dimensions.height
        });
    }
    _getTerminalDimensions() {
        const cssCellDims = this._terminal._core._renderService.dimensions.css.cell;
        return {
            width: cssCellDims.width,
            height: cssCellDims.height,
        };
    }
    _showCompletions(model) {
        if (!this._terminal?.element) {
            return;
        }
        const suggestWidget = this._ensureSuggestWidget(this._terminal);
        suggestWidget.setCompletionModel(model);
        if (model.items.length === 0 || !this._promptInputModel) {
            return;
        }
        this._model = model;
        const dimensions = this._getTerminalDimensions();
        if (!dimensions.width || !dimensions.height) {
            return;
        }
        const xtermBox = this._screen.getBoundingClientRect();
        suggestWidget.showSuggestions(0, false, false, {
            left: xtermBox.left + this._terminal.buffer.active.cursorX * dimensions.width,
            top: xtermBox.top + this._terminal.buffer.active.cursorY * dimensions.height,
            height: dimensions.height
        });
    }
    _ensureSuggestWidget(terminal) {
        if (!this._suggestWidget) {
            const c = this._terminalConfigurationService.config;
            const font = this._terminalConfigurationService.getFont(dom.getActiveWindow());
            const fontInfo = {
                fontFamily: font.fontFamily,
                fontSize: font.fontSize,
                lineHeight: Math.ceil(1.5 * font.fontSize),
                fontWeight: c.fontWeight.toString(),
                letterSpacing: font.letterSpacing
            };
            this._suggestWidget = this._register(this._instantiationService.createInstance(SimpleSuggestWidget, this._container, this._instantiationService.createInstance(PersistedWidgetSize), () => fontInfo, {}));
            this._suggestWidget.list.style(getListStyles({
                listInactiveFocusBackground: editorSuggestWidgetSelectedBackground,
                listInactiveFocusOutline: activeContrastBorder
            }));
            this._register(this._suggestWidget.onDidSelect(async (e) => this.acceptSelectedSuggestion(e)));
            this._register(this._suggestWidget.onDidHide(() => this._terminalSuggestWidgetVisibleContextKey.set(false)));
            this._register(this._suggestWidget.onDidShow(() => this._terminalSuggestWidgetVisibleContextKey.set(true)));
            this._terminalSuggestWidgetVisibleContextKey.set(false);
        }
        return this._suggestWidget;
    }
    selectPreviousSuggestion() {
        this._suggestWidget?.selectPrevious();
    }
    selectPreviousPageSuggestion() {
        this._suggestWidget?.selectPreviousPage();
    }
    selectNextSuggestion() {
        this._suggestWidget?.selectNext();
    }
    selectNextPageSuggestion() {
        this._suggestWidget?.selectNextPage();
    }
    acceptSelectedSuggestion(suggestion, respectRunOnEnter) {
        if (!suggestion) {
            suggestion = this._suggestWidget?.getFocusedItem();
        }
        const initialPromptInputState = this._mostRecentPromptInputState;
        if (!suggestion || !initialPromptInputState || this._leadingLineContent === undefined || !this._model) {
            return;
        }
        SuggestAddon_1.lastAcceptedCompletionTimestamp = Date.now();
        this._suggestWidget?.hide();
        const currentPromptInputState = this._currentPromptInputState ?? initialPromptInputState;
        // The replacement text is any text after the replacement index for the completions, this
        // includes any text that was there before the completions were requested and any text added
        // since to refine the completion.
        const replacementText = currentPromptInputState.value.substring(suggestion.item.completion.replacementIndex ?? this._providerReplacementIndex, currentPromptInputState.cursorIndex);
        // Right side of replacement text in the same word
        let rightSideReplacementText = '';
        if (
        // The line didn't end with ghost text
        (currentPromptInputState.ghostTextIndex === -1 || currentPromptInputState.ghostTextIndex > currentPromptInputState.cursorIndex) &&
            // There is more than one charatcer
            currentPromptInputState.value.length > currentPromptInputState.cursorIndex + 1 &&
            // THe next character is not a space
            currentPromptInputState.value.at(currentPromptInputState.cursorIndex) !== ' ') {
            const spaceIndex = currentPromptInputState.value.substring(currentPromptInputState.cursorIndex, currentPromptInputState.ghostTextIndex === -1 ? undefined : currentPromptInputState.ghostTextIndex).indexOf(' ');
            rightSideReplacementText = currentPromptInputState.value.substring(currentPromptInputState.cursorIndex, spaceIndex === -1 ? undefined : currentPromptInputState.cursorIndex + spaceIndex);
        }
        const completion = suggestion.item.completion;
        const completionText = completion.label;
        let runOnEnter = false;
        if (respectRunOnEnter) {
            const runOnEnterConfig = this._configurationService.getValue(terminalSuggestConfigSection).runOnEnter;
            switch (runOnEnterConfig) {
                case 'always': {
                    runOnEnter = true;
                    break;
                }
                case 'exactMatch': {
                    runOnEnter = replacementText.toLowerCase() === completionText.toLowerCase();
                    break;
                }
                case 'exactMatchIgnoreExtension': {
                    runOnEnter = replacementText.toLowerCase() === completionText.toLowerCase();
                    if (completion.isFile) {
                        runOnEnter ||= replacementText.toLowerCase() === completionText.toLowerCase().replace(/\.[^\.]+$/, '');
                    }
                    break;
                }
            }
        }
        // For folders, allow the next completion request to get completions for that folder
        if (completion.icon === Codicon.folder) {
            SuggestAddon_1.lastAcceptedCompletionTimestamp = 0;
        }
        this._mostRecentCompletion = completion;
        const commonPrefixLen = commonPrefixLength(replacementText, completion.label);
        const commonPrefix = replacementText.substring(replacementText.length - 1 - commonPrefixLen, replacementText.length - 1);
        const completionSuffix = completion.label.substring(commonPrefixLen);
        let resultSequence;
        if (currentPromptInputState.suffix.length > 0 && currentPromptInputState.prefix.endsWith(commonPrefix) && currentPromptInputState.suffix.startsWith(completionSuffix)) {
            // Move right to the end of the completion
            resultSequence = '\x1bOC'.repeat(completion.label.length - commonPrefixLen);
        }
        else {
            resultSequence = [
                // Backspace (left) to remove all additional input
                '\x7F'.repeat(replacementText.length - commonPrefixLen),
                // Delete (right) to remove any additional text in the same word
                '\x1b[3~'.repeat(rightSideReplacementText.length),
                // Write the completion
                completionSuffix,
                // Run on enter if needed
                runOnEnter ? '\r' : ''
            ].join('');
        }
        // Send the completion
        this._onAcceptedCompletion.fire(resultSequence);
        this.hideSuggestWidget();
    }
    hideSuggestWidget() {
        this._cancellationTokenSource?.cancel();
        this._cancellationTokenSource = undefined;
        this._currentPromptInputState = undefined;
        this._leadingLineContent = undefined;
        this._suggestWidget?.hide();
    }
};
SuggestAddon = SuggestAddon_1 = __decorate([
    __param(3, ITerminalCompletionService),
    __param(4, IConfigurationService),
    __param(5, IInstantiationService),
    __param(6, ITerminalConfigurationService)
], SuggestAddon);
export { SuggestAddon };
let PersistedWidgetSize = class PersistedWidgetSize {
    constructor(_storageService) {
        this._storageService = _storageService;
        this._key = "terminal.integrated.suggestSize" /* TerminalStorageKeys.TerminalSuggestSize */;
    }
    restore() {
        const raw = this._storageService.get(this._key, 0 /* StorageScope.PROFILE */) ?? '';
        try {
            const obj = JSON.parse(raw);
            if (dom.Dimension.is(obj)) {
                return dom.Dimension.lift(obj);
            }
        }
        catch {
            // ignore
        }
        return undefined;
    }
    store(size) {
        this._storageService.store(this._key, JSON.stringify(size), 0 /* StorageScope.PROFILE */, 1 /* StorageTarget.MACHINE */);
    }
    reset() {
        this._storageService.remove(this._key, 0 /* StorageScope.PROFILE */);
    }
};
PersistedWidgetSize = __decorate([
    __param(0, IStorageService)
], PersistedWidgetSize);
export function normalizePathSeparator(path, sep) {
    if (sep === '/') {
        return path.replaceAll('\\', '/');
    }
    return path.replaceAll('/', '\\');
}
