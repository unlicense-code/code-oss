/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import assert from 'assert';
import { CancellationToken } from '../../../../../base/common/cancellation.js';
import { HierarchicalKind } from '../../../../../base/common/hierarchicalKind.js';
import { DisposableStore } from '../../../../../base/common/lifecycle.js';
import { URI } from '../../../../../base/common/uri.js';
import { ensureNoDisposablesAreLeakedInTestSuite } from '../../../../../base/test/common/utils.js';
import { Range } from '../../../../common/core/range.js';
import { LanguageFeatureRegistry } from '../../../../common/languageFeatureRegistry.js';
import { getCodeActions } from '../../browser/codeAction.js';
import { CodeActionItem, CodeActionKind, CodeActionTriggerSource } from '../../common/types.js';
import { createTextModel } from '../../../../test/common/testTextModel.js';
import { MarkerSeverity } from '../../../../../platform/markers/common/markers.js';
import { Progress } from '../../../../../platform/progress/common/progress.js';
function staticCodeActionProvider(...actions) {
    return new class {
        provideCodeActions() {
            return {
                actions: actions,
                dispose: () => { }
            };
        }
    };
}
suite('CodeAction', () => {
    const langId = 'fooLang';
    const uri = URI.parse('untitled:path');
    let model;
    let registry;
    const disposables = new DisposableStore();
    const testData = {
        diagnostics: {
            abc: {
                title: 'bTitle',
                diagnostics: [{
                        startLineNumber: 1,
                        startColumn: 1,
                        endLineNumber: 2,
                        endColumn: 1,
                        severity: MarkerSeverity.Error,
                        message: 'abc'
                    }]
            },
            bcd: {
                title: 'aTitle',
                diagnostics: [{
                        startLineNumber: 1,
                        startColumn: 1,
                        endLineNumber: 2,
                        endColumn: 1,
                        severity: MarkerSeverity.Error,
                        message: 'bcd'
                    }]
            }
        },
        command: {
            abc: {
                command: new class {
                },
                title: 'Extract to inner function in function "test"'
            }
        },
        spelling: {
            bcd: {
                diagnostics: [],
                edit: new class {
                },
                title: 'abc'
            }
        },
        tsLint: {
            abc: {
                $ident: 'funny' + 57,
                arguments: [],
                id: '_internal_command_delegation',
                title: 'abc'
            },
            bcd: {
                $ident: 'funny' + 47,
                arguments: [],
                id: '_internal_command_delegation',
                title: 'bcd'
            }
        }
    };
    setup(() => {
        registry = new LanguageFeatureRegistry();
        disposables.clear();
        model = createTextModel('test1\ntest2\ntest3', langId, undefined, uri);
        disposables.add(model);
    });
    teardown(() => {
        disposables.clear();
    });
    ensureNoDisposablesAreLeakedInTestSuite();
    test('CodeActions are sorted by type, #38623', async () => {
        const provider = staticCodeActionProvider(testData.command.abc, testData.diagnostics.bcd, testData.spelling.bcd, testData.tsLint.bcd, testData.tsLint.abc, testData.diagnostics.abc);
        disposables.add(registry.register('fooLang', provider));
        const expected = [
            // CodeActions with a diagnostics array are shown first without further sorting
            new CodeActionItem(testData.diagnostics.bcd, provider),
            new CodeActionItem(testData.diagnostics.abc, provider),
            // CodeActions without diagnostics are shown in the given order without any further sorting
            new CodeActionItem(testData.command.abc, provider),
            new CodeActionItem(testData.spelling.bcd, provider),
            new CodeActionItem(testData.tsLint.bcd, provider),
            new CodeActionItem(testData.tsLint.abc, provider)
        ];
        const { validActions: actions } = disposables.add(await getCodeActions(registry, model, new Range(1, 1, 2, 1), { type: 1 /* languages.CodeActionTriggerType.Invoke */, triggerAction: CodeActionTriggerSource.Default }, Progress.None, CancellationToken.None));
        assert.strictEqual(actions.length, 6);
        assert.deepStrictEqual(actions, expected);
    });
    test('getCodeActions should filter by scope', async () => {
        const provider = staticCodeActionProvider({ title: 'a', kind: 'a' }, { title: 'b', kind: 'b' }, { title: 'a.b', kind: 'a.b' });
        disposables.add(registry.register('fooLang', provider));
        {
            const { validActions: actions } = disposables.add(await getCodeActions(registry, model, new Range(1, 1, 2, 1), { type: 2 /* languages.CodeActionTriggerType.Auto */, triggerAction: CodeActionTriggerSource.Default, filter: { include: new HierarchicalKind('a') } }, Progress.None, CancellationToken.None));
            assert.strictEqual(actions.length, 2);
            assert.strictEqual(actions[0].action.title, 'a');
            assert.strictEqual(actions[1].action.title, 'a.b');
        }
        {
            const { validActions: actions } = disposables.add(await getCodeActions(registry, model, new Range(1, 1, 2, 1), { type: 2 /* languages.CodeActionTriggerType.Auto */, triggerAction: CodeActionTriggerSource.Default, filter: { include: new HierarchicalKind('a.b') } }, Progress.None, CancellationToken.None));
            assert.strictEqual(actions.length, 1);
            assert.strictEqual(actions[0].action.title, 'a.b');
        }
        {
            const { validActions: actions } = disposables.add(await getCodeActions(registry, model, new Range(1, 1, 2, 1), { type: 2 /* languages.CodeActionTriggerType.Auto */, triggerAction: CodeActionTriggerSource.Default, filter: { include: new HierarchicalKind('a.b.c') } }, Progress.None, CancellationToken.None));
            assert.strictEqual(actions.length, 0);
        }
    });
    test('getCodeActions should forward requested scope to providers', async () => {
        const provider = new class {
            provideCodeActions(_model, _range, context, _token) {
                return {
                    actions: [
                        { title: context.only || '', kind: context.only }
                    ],
                    dispose: () => { }
                };
            }
        };
        disposables.add(registry.register('fooLang', provider));
        const { validActions: actions } = disposables.add(await getCodeActions(registry, model, new Range(1, 1, 2, 1), { type: 2 /* languages.CodeActionTriggerType.Auto */, triggerAction: CodeActionTriggerSource.Default, filter: { include: new HierarchicalKind('a') } }, Progress.None, CancellationToken.None));
        assert.strictEqual(actions.length, 1);
        assert.strictEqual(actions[0].action.title, 'a');
    });
    test('getCodeActions should not return source code action by default', async () => {
        const provider = staticCodeActionProvider({ title: 'a', kind: CodeActionKind.Source.value }, { title: 'b', kind: 'b' });
        disposables.add(registry.register('fooLang', provider));
        {
            const { validActions: actions } = disposables.add(await getCodeActions(registry, model, new Range(1, 1, 2, 1), { type: 2 /* languages.CodeActionTriggerType.Auto */, triggerAction: CodeActionTriggerSource.SourceAction }, Progress.None, CancellationToken.None));
            assert.strictEqual(actions.length, 1);
            assert.strictEqual(actions[0].action.title, 'b');
        }
        {
            const { validActions: actions } = disposables.add(await getCodeActions(registry, model, new Range(1, 1, 2, 1), { type: 2 /* languages.CodeActionTriggerType.Auto */, triggerAction: CodeActionTriggerSource.Default, filter: { include: CodeActionKind.Source, includeSourceActions: true } }, Progress.None, CancellationToken.None));
            assert.strictEqual(actions.length, 1);
            assert.strictEqual(actions[0].action.title, 'a');
        }
    });
    test('getCodeActions should support filtering out some requested source code actions #84602', async () => {
        const provider = staticCodeActionProvider({ title: 'a', kind: CodeActionKind.Source.value }, { title: 'b', kind: CodeActionKind.Source.append('test').value }, { title: 'c', kind: 'c' });
        disposables.add(registry.register('fooLang', provider));
        {
            const { validActions: actions } = disposables.add(await getCodeActions(registry, model, new Range(1, 1, 2, 1), {
                type: 2 /* languages.CodeActionTriggerType.Auto */, triggerAction: CodeActionTriggerSource.SourceAction, filter: {
                    include: CodeActionKind.Source.append('test'),
                    excludes: [CodeActionKind.Source],
                    includeSourceActions: true,
                }
            }, Progress.None, CancellationToken.None));
            assert.strictEqual(actions.length, 1);
            assert.strictEqual(actions[0].action.title, 'b');
        }
    });
    test('getCodeActions no invoke a provider that has been excluded #84602', async () => {
        const baseType = CodeActionKind.Refactor;
        const subType = CodeActionKind.Refactor.append('sub');
        disposables.add(registry.register('fooLang', staticCodeActionProvider({ title: 'a', kind: baseType.value })));
        let didInvoke = false;
        disposables.add(registry.register('fooLang', new class {
            constructor() {
                this.providedCodeActionKinds = [subType.value];
            }
            provideCodeActions() {
                didInvoke = true;
                return {
                    actions: [
                        { title: 'x', kind: subType.value }
                    ],
                    dispose: () => { }
                };
            }
        }));
        {
            const { validActions: actions } = disposables.add(await getCodeActions(registry, model, new Range(1, 1, 2, 1), {
                type: 2 /* languages.CodeActionTriggerType.Auto */, triggerAction: CodeActionTriggerSource.Refactor, filter: {
                    include: baseType,
                    excludes: [subType],
                }
            }, Progress.None, CancellationToken.None));
            assert.strictEqual(didInvoke, false);
            assert.strictEqual(actions.length, 1);
            assert.strictEqual(actions[0].action.title, 'a');
        }
    });
    test('getCodeActions should not invoke code action providers filtered out by providedCodeActionKinds', async () => {
        let wasInvoked = false;
        const provider = new class {
            constructor() {
                this.providedCodeActionKinds = [CodeActionKind.Refactor.value];
            }
            provideCodeActions() {
                wasInvoked = true;
                return { actions: [], dispose: () => { } };
            }
        };
        disposables.add(registry.register('fooLang', provider));
        const { validActions: actions } = disposables.add(await getCodeActions(registry, model, new Range(1, 1, 2, 1), {
            type: 2 /* languages.CodeActionTriggerType.Auto */, triggerAction: CodeActionTriggerSource.Refactor,
            filter: {
                include: CodeActionKind.QuickFix
            }
        }, Progress.None, CancellationToken.None));
        assert.strictEqual(actions.length, 0);
        assert.strictEqual(wasInvoked, false);
    });
});
