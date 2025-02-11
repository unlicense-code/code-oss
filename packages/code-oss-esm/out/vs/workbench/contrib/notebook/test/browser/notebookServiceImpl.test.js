/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import assert from 'assert';
import { Event } from '../../../../../base/common/event.js';
import { URI } from '../../../../../base/common/uri.js';
import { mock } from '../../../../../base/test/common/mock.js';
import { ensureNoDisposablesAreLeakedInTestSuite } from '../../../../../base/test/common/utils.js';
import { TestConfigurationService } from '../../../../../platform/configuration/test/common/testConfigurationService.js';
import { NotebookProviderInfoStore } from '../../browser/services/notebookServiceImpl.js';
import { NotebookProviderInfo } from '../../common/notebookProvider.js';
import { EditorResolverService } from '../../../../services/editor/browser/editorResolverService.js';
import { RegisteredEditorPriority } from '../../../../services/editor/common/editorResolverService.js';
import { nullExtensionDescription } from '../../../../services/extensions/common/extensions.js';
import { workbenchInstantiationService } from '../../../../test/browser/workbenchTestServices.js';
suite('NotebookProviderInfoStore', function () {
    const disposables = ensureNoDisposablesAreLeakedInTestSuite();
    test('Can\'t open untitled notebooks in test #119363', function () {
        const instantiationService = workbenchInstantiationService(undefined, disposables);
        const store = new NotebookProviderInfoStore(new class extends mock() {
            get() { return ''; }
            store() { }
            getObject() { return {}; }
        }, new class extends mock() {
            constructor() {
                super(...arguments);
                this.onDidRegisterExtensions = Event.None;
            }
        }, disposables.add(instantiationService.createInstance(EditorResolverService)), new TestConfigurationService(), new class extends mock() {
            constructor() {
                super(...arguments);
                this.onDidChangeScreenReaderOptimized = Event.None;
            }
        }, instantiationService, new class extends mock() {
            hasProvider() { return true; }
        }, new class extends mock() {
        }, new class extends mock() {
        });
        disposables.add(store);
        const fooInfo = new NotebookProviderInfo({
            extension: nullExtensionDescription.identifier,
            id: 'foo',
            displayName: 'foo',
            selectors: [{ filenamePattern: '*.foo' }],
            priority: RegisteredEditorPriority.default,
            providerDisplayName: 'foo',
        });
        const barInfo = new NotebookProviderInfo({
            extension: nullExtensionDescription.identifier,
            id: 'bar',
            displayName: 'bar',
            selectors: [{ filenamePattern: '*.bar' }],
            priority: RegisteredEditorPriority.default,
            providerDisplayName: 'bar',
        });
        store.add(fooInfo);
        store.add(barInfo);
        assert.ok(store.get('foo'));
        assert.ok(store.get('bar'));
        assert.ok(!store.get('barfoo'));
        let providers = store.getContributedNotebook(URI.parse('file:///test/nb.foo'));
        assert.strictEqual(providers.length, 1);
        assert.strictEqual(providers[0] === fooInfo, true);
        providers = store.getContributedNotebook(URI.parse('file:///test/nb.bar'));
        assert.strictEqual(providers.length, 1);
        assert.strictEqual(providers[0] === barInfo, true);
        providers = store.getContributedNotebook(URI.parse('untitled:///Untitled-1'));
        assert.strictEqual(providers.length, 2);
        assert.strictEqual(providers[0] === fooInfo, true);
        assert.strictEqual(providers[1] === barInfo, true);
        providers = store.getContributedNotebook(URI.parse('untitled:///test/nb.bar'));
        assert.strictEqual(providers.length, 1);
        assert.strictEqual(providers[0] === barInfo, true);
    });
});
