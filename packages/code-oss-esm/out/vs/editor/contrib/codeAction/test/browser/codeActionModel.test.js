/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import assert from 'assert';
import { promiseWithResolvers } from '../../../../../base/common/async.js';
import { DisposableStore } from '../../../../../base/common/lifecycle.js';
import { assertType } from '../../../../../base/common/types.js';
import { URI } from '../../../../../base/common/uri.js';
import { runWithFakedTimers } from '../../../../../base/test/common/timeTravelScheduler.js';
import { LanguageFeatureRegistry } from '../../../../common/languageFeatureRegistry.js';
import { CodeActionModel } from '../../browser/codeActionModel.js';
import { createTestCodeEditor } from '../../../../test/browser/testCodeEditor.js';
import { createTextModel } from '../../../../test/common/testTextModel.js';
import { MockContextKeyService } from '../../../../../platform/keybinding/test/common/mockKeybindingService.js';
import { MarkerService } from '../../../../../platform/markers/common/markerService.js';
const testProvider = {
    provideCodeActions() {
        return {
            actions: [
                { title: 'test', command: { id: 'test-command', title: 'test', arguments: [] } }
            ],
            dispose() { }
        };
    }
};
suite('CodeActionModel', () => {
    const languageId = 'foo-lang';
    const uri = URI.parse('untitled:path');
    let model;
    let markerService;
    let editor;
    let registry;
    const disposables = new DisposableStore();
    setup(() => {
        disposables.clear();
        markerService = new MarkerService();
        model = createTextModel('foobar  foo bar\nfarboo far boo', languageId, undefined, uri);
        editor = createTestCodeEditor(model);
        editor.setPosition({ lineNumber: 1, column: 1 });
        registry = new LanguageFeatureRegistry();
    });
    teardown(() => {
        disposables.clear();
        editor.dispose();
        model.dispose();
        markerService.dispose();
    });
    test('Oracle -> marker added', async () => {
        const { promise: donePromise, resolve: done } = promiseWithResolvers();
        await runWithFakedTimers({ useFakeTimers: true }, () => {
            const reg = registry.register(languageId, testProvider);
            disposables.add(reg);
            const contextKeys = new MockContextKeyService();
            const model = disposables.add(new CodeActionModel(editor, registry, markerService, contextKeys, undefined));
            disposables.add(model.onDidChangeState((e) => {
                assertType(e.type === 1 /* CodeActionsState.Type.Triggered */);
                assert.strictEqual(e.trigger.type, 2 /* languages.CodeActionTriggerType.Auto */);
                assert.ok(e.actions);
                e.actions.then(fixes => {
                    model.dispose();
                    assert.strictEqual(fixes.validActions.length, 1);
                    done();
                }, done);
            }));
            // start here
            markerService.changeOne('fake', uri, [{
                    startLineNumber: 1, startColumn: 1, endLineNumber: 1, endColumn: 6,
                    message: 'error',
                    severity: 1,
                    code: '',
                    source: ''
                }]);
            return donePromise;
        });
    });
    test('Oracle -> position changed', async () => {
        await runWithFakedTimers({ useFakeTimers: true }, () => {
            const reg = registry.register(languageId, testProvider);
            disposables.add(reg);
            markerService.changeOne('fake', uri, [{
                    startLineNumber: 1, startColumn: 1, endLineNumber: 1, endColumn: 6,
                    message: 'error',
                    severity: 1,
                    code: '',
                    source: ''
                }]);
            editor.setPosition({ lineNumber: 2, column: 1 });
            return new Promise((resolve, reject) => {
                const contextKeys = new MockContextKeyService();
                const model = disposables.add(new CodeActionModel(editor, registry, markerService, contextKeys, undefined));
                disposables.add(model.onDidChangeState((e) => {
                    assertType(e.type === 1 /* CodeActionsState.Type.Triggered */);
                    assert.strictEqual(e.trigger.type, 2 /* languages.CodeActionTriggerType.Auto */);
                    assert.ok(e.actions);
                    e.actions.then(fixes => {
                        model.dispose();
                        assert.strictEqual(fixes.validActions.length, 1);
                        resolve(undefined);
                    }, reject);
                }));
                // start here
                editor.setPosition({ lineNumber: 1, column: 1 });
            });
        });
    });
    test('Oracle -> should only auto trigger once for cursor and marker update right after each other', async () => {
        const { promise: donePromise, resolve: done } = promiseWithResolvers();
        await runWithFakedTimers({ useFakeTimers: true }, () => {
            const reg = registry.register(languageId, testProvider);
            disposables.add(reg);
            let triggerCount = 0;
            const contextKeys = new MockContextKeyService();
            const model = disposables.add(new CodeActionModel(editor, registry, markerService, contextKeys, undefined));
            disposables.add(model.onDidChangeState((e) => {
                assertType(e.type === 1 /* CodeActionsState.Type.Triggered */);
                assert.strictEqual(e.trigger.type, 2 /* languages.CodeActionTriggerType.Auto */);
                ++triggerCount;
                // give time for second trigger before completing test
                setTimeout(() => {
                    model.dispose();
                    assert.strictEqual(triggerCount, 1);
                    done();
                }, 0);
            }, 5 /*delay*/));
            markerService.changeOne('fake', uri, [{
                    startLineNumber: 1, startColumn: 1, endLineNumber: 1, endColumn: 6,
                    message: 'error',
                    severity: 1,
                    code: '',
                    source: ''
                }]);
            editor.setSelection({ startLineNumber: 1, startColumn: 1, endLineNumber: 4, endColumn: 1 });
            return donePromise;
        });
    });
});
