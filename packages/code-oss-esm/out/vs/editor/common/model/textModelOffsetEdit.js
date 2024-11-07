/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { EditOperation } from '../core/editOperation.js';
import { Range } from '../core/range.js';
import { OffsetEdit, SingleOffsetEdit } from '../core/offsetEdit.js';
import { OffsetRange } from '../core/offsetRange.js';
export class OffsetEdits {
    constructor() {
        // static utils only!
    }
    static asEditOperations(offsetEdit, doc) {
        const edits = [];
        for (const singleEdit of offsetEdit.edits) {
            const range = Range.fromPositions(doc.getPositionAt(singleEdit.replaceRange.start), doc.getPositionAt(singleEdit.replaceRange.start + singleEdit.replaceRange.length));
            edits.push(EditOperation.replace(range, singleEdit.newText));
        }
        return edits;
    }
    static fromContentChanges(contentChanges) {
        const editsArr = contentChanges.map(c => new SingleOffsetEdit(OffsetRange.ofStartAndLength(c.rangeOffset, c.rangeLength), c.text));
        editsArr.reverse();
        const edits = new OffsetEdit(editsArr);
        return edits;
    }
    static fromLineRangeMapping(original, modified, changes) {
        const edits = [];
        for (const c of changes) {
            for (const i of c.innerChanges ?? []) {
                const newText = modified.getValueInRange(i.modifiedRange);
                const startOrig = original.getOffsetAt(i.originalRange.getStartPosition());
                const endExOrig = original.getOffsetAt(i.originalRange.getEndPosition());
                const origRange = new OffsetRange(startOrig, endExOrig);
                edits.push(new SingleOffsetEdit(origRange, newText));
            }
        }
        return new OffsetEdit(edits);
    }
}
