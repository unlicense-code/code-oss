/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import assert from 'assert';
import { ensureNoDisposablesAreLeakedInTestSuite } from '../../../../base/test/common/utils.js';
import { TextModelTreeSitter, TreeSitterImporter, TreeSitterLanguages } from '../../../browser/services/treeSitter/treeSitterParserService.js';
import { createTextModel } from '../../common/testTextModel.js';
import { timeout } from '../../../../base/common/async.js';
import { ConsoleMainLogger } from '../../../../platform/log/common/log.js';
import { LogService } from '../../../../platform/log/common/logService.js';
import { mock } from '../../../../base/test/common/mock.js';
class MockParser {
    static async init() { }
    delete() { }
    parse(input, oldTree, options) {
        return new MockTree();
    }
    getIncludedRanges() {
        return [];
    }
    getTimeoutMicros() { return 0; }
    setTimeoutMicros(timeout) { }
    reset() { }
    getLanguage() { return {}; }
    setLanguage() { }
    getLogger() {
        throw new Error('Method not implemented.');
    }
    setLogger(logFunc) {
        throw new Error('Method not implemented.');
    }
}
class MockTreeSitterImporter extends TreeSitterImporter {
    async getParserClass() {
        return MockParser;
    }
}
class MockTree {
    constructor() {
        this.editorLanguage = '';
        this.editorContents = '';
        this.rootNode = {};
    }
    rootNodeWithOffset(offsetBytes, offsetExtent) {
        throw new Error('Method not implemented.');
    }
    copy() {
        throw new Error('Method not implemented.');
    }
    delete() { }
    edit(edit) {
        return this;
    }
    walk() {
        throw new Error('Method not implemented.');
    }
    getChangedRanges(other) {
        throw new Error('Method not implemented.');
    }
    getIncludedRanges() {
        throw new Error('Method not implemented.');
    }
    getEditedRange(other) {
        throw new Error('Method not implemented.');
    }
    getLanguage() {
        throw new Error('Method not implemented.');
    }
}
class MockLanguage {
    constructor() {
        this.version = 0;
        this.fieldCount = 0;
        this.stateCount = 0;
        this.nodeTypeCount = 0;
        this.languageId = '';
    }
    fieldNameForId(fieldId) {
        throw new Error('Method not implemented.');
    }
    fieldIdForName(fieldName) {
        throw new Error('Method not implemented.');
    }
    idForNodeType(type, named) {
        throw new Error('Method not implemented.');
    }
    nodeTypeForId(typeId) {
        throw new Error('Method not implemented.');
    }
    nodeTypeIsNamed(typeId) {
        throw new Error('Method not implemented.');
    }
    nodeTypeIsVisible(typeId) {
        throw new Error('Method not implemented.');
    }
    nextState(stateId, typeId) {
        throw new Error('Method not implemented.');
    }
    query(source) {
        throw new Error('Method not implemented.');
    }
    lookaheadIterator(stateId) {
        throw new Error('Method not implemented.');
    }
}
suite('TreeSitterParserService', function () {
    const treeSitterImporter = new MockTreeSitterImporter();
    let logService;
    let telemetryService;
    setup(function () {
        logService = new LogService(new ConsoleMainLogger());
        telemetryService = new class extends mock() {
            async publicLog2() {
                //
            }
        };
    });
    const store = ensureNoDisposablesAreLeakedInTestSuite();
    test('TextModelTreeSitter race condition: first language is slow to load', async function () {
        class MockTreeSitterLanguages extends TreeSitterLanguages {
            async _fetchJavascript() {
                await timeout(200);
                const language = new MockLanguage();
                language.languageId = 'javascript';
                this._onDidAddLanguage.fire({ id: 'javascript', language });
            }
            getOrInitLanguage(languageId) {
                if (languageId === 'javascript') {
                    this._fetchJavascript();
                    return undefined;
                }
                const language = new MockLanguage();
                language.languageId = languageId;
                return language;
            }
        }
        const treeSitterParser = store.add(new MockTreeSitterLanguages(treeSitterImporter, {}, { isBuilt: false }, new Map()));
        const textModel = store.add(createTextModel('console.log("Hello, world!");', 'javascript'));
        const textModelTreeSitter = store.add(new TextModelTreeSitter(textModel, treeSitterParser, treeSitterImporter, logService, telemetryService));
        textModel.setLanguage('typescript');
        await timeout(300);
        assert.strictEqual((textModelTreeSitter.parseResult?.language).languageId, 'typescript');
    });
});
