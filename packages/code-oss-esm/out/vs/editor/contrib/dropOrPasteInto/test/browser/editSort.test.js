/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import assert from 'assert';
import { HierarchicalKind } from '../../../../../base/common/hierarchicalKind.js';
import { ensureNoDisposablesAreLeakedInTestSuite } from '../../../../../base/test/common/utils.js';
import { sortEditsByYieldTo } from '../../browser/edit.js';
function createTestEdit(kind, args) {
    return {
        title: '',
        insertText: '',
        kind: new HierarchicalKind(kind),
        ...args,
    };
}
suite('sortEditsByYieldTo', () => {
    test('Should noop for empty edits', () => {
        const edits = [];
        assert.deepStrictEqual(sortEditsByYieldTo(edits), []);
    });
    test('Yielded to edit should get sorted after target', () => {
        const edits = [
            createTestEdit('a', { yieldTo: [{ kind: new HierarchicalKind('b') }] }),
            createTestEdit('b'),
        ];
        assert.deepStrictEqual(sortEditsByYieldTo(edits).map(x => x.kind?.value), ['b', 'a']);
    });
    test('Should handle chain of yield to', () => {
        {
            const edits = [
                createTestEdit('c', { yieldTo: [{ kind: new HierarchicalKind('a') }] }),
                createTestEdit('a', { yieldTo: [{ kind: new HierarchicalKind('b') }] }),
                createTestEdit('b'),
            ];
            assert.deepStrictEqual(sortEditsByYieldTo(edits).map(x => x.kind?.value), ['b', 'a', 'c']);
        }
        {
            const edits = [
                createTestEdit('a', { yieldTo: [{ kind: new HierarchicalKind('b') }] }),
                createTestEdit('c', { yieldTo: [{ kind: new HierarchicalKind('a') }] }),
                createTestEdit('b'),
            ];
            assert.deepStrictEqual(sortEditsByYieldTo(edits).map(x => x.kind?.value), ['b', 'a', 'c']);
        }
    });
    test(`Should not reorder when yield to isn't used`, () => {
        const edits = [
            createTestEdit('c', { yieldTo: [{ kind: new HierarchicalKind('x') }] }),
            createTestEdit('a', { yieldTo: [{ kind: new HierarchicalKind('y') }] }),
            createTestEdit('b'),
        ];
        assert.deepStrictEqual(sortEditsByYieldTo(edits).map(x => x.kind?.value), ['c', 'a', 'b']);
    });
    ensureNoDisposablesAreLeakedInTestSuite();
});
