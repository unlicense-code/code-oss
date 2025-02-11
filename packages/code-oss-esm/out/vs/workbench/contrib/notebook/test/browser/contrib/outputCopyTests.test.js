/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { mock } from '../../../../../../base/test/common/mock.js';
import assert from 'assert';
import { VSBuffer } from '../../../../../../base/common/buffer.js';
import { ensureNoDisposablesAreLeakedInTestSuite } from '../../../../../../base/test/common/utils.js';
import { copyCellOutput } from '../../../browser/viewModel/cellOutputTextHelper.js';
suite('Cell Output Clipboard Tests', () => {
    ensureNoDisposablesAreLeakedInTestSuite();
    class ClipboardService {
        constructor() {
            this._clipboardContent = '';
        }
        get clipboardContent() {
            return this._clipboardContent;
        }
        async writeText(value) {
            this._clipboardContent = value;
        }
    }
    const logService = new class extends mock() {
    };
    function createOutputViewModel(outputs, cellViewModel) {
        const outputViewModel = { model: { outputs: outputs } };
        if (cellViewModel) {
            cellViewModel.outputsViewModels.push(outputViewModel);
            cellViewModel.model.outputs.push(outputViewModel.model);
        }
        else {
            cellViewModel = {
                outputsViewModels: [outputViewModel],
                model: { outputs: [outputViewModel.model] }
            };
        }
        outputViewModel.cellViewModel = cellViewModel;
        return outputViewModel;
    }
    test('Copy text/plain output', async () => {
        const mimeType = 'text/plain';
        const clipboard = new ClipboardService();
        const outputDto = { data: VSBuffer.fromString('output content'), mime: 'text/plain' };
        const output = createOutputViewModel([outputDto]);
        await copyCellOutput(mimeType, output, clipboard, logService);
        assert.strictEqual(clipboard.clipboardContent, 'output content');
    });
    test('Nothing copied for invalid mimetype', async () => {
        const clipboard = new ClipboardService();
        const outputDtos = [
            { data: VSBuffer.fromString('output content'), mime: 'bad' },
            { data: VSBuffer.fromString('output 2'), mime: 'unknown' }
        ];
        const output = createOutputViewModel(outputDtos);
        await copyCellOutput('bad', output, clipboard, logService);
        assert.strictEqual(clipboard.clipboardContent, '');
    });
    test('Text copied if available instead of invalid mime type', async () => {
        const clipboard = new ClipboardService();
        const outputDtos = [
            { data: VSBuffer.fromString('output content'), mime: 'bad' },
            { data: VSBuffer.fromString('text content'), mime: 'text/plain' }
        ];
        const output = createOutputViewModel(outputDtos);
        await copyCellOutput('bad', output, clipboard, logService);
        assert.strictEqual(clipboard.clipboardContent, 'text content');
    });
    test('Selected mimetype is preferred', async () => {
        const clipboard = new ClipboardService();
        const outputDtos = [
            { data: VSBuffer.fromString('plain text'), mime: 'text/plain' },
            { data: VSBuffer.fromString('html content'), mime: 'text/html' }
        ];
        const output = createOutputViewModel(outputDtos);
        await copyCellOutput('text/html', output, clipboard, logService);
        assert.strictEqual(clipboard.clipboardContent, 'html content');
    });
    test('copy subsequent output', async () => {
        const clipboard = new ClipboardService();
        const output = createOutputViewModel([{ data: VSBuffer.fromString('first'), mime: 'text/plain' }]);
        const output2 = createOutputViewModel([{ data: VSBuffer.fromString('second'), mime: 'text/plain' }], output.cellViewModel);
        const output3 = createOutputViewModel([{ data: VSBuffer.fromString('third'), mime: 'text/plain' }], output.cellViewModel);
        await copyCellOutput('text/plain', output2, clipboard, logService);
        assert.strictEqual(clipboard.clipboardContent, 'second');
        await copyCellOutput('text/plain', output3, clipboard, logService);
        assert.strictEqual(clipboard.clipboardContent, 'third');
    });
    test('adjacent stream outputs are concanented', async () => {
        const clipboard = new ClipboardService();
        const output = createOutputViewModel([{ data: VSBuffer.fromString('stdout'), mime: 'application/vnd.code.notebook.stdout' }]);
        createOutputViewModel([{ data: VSBuffer.fromString('stderr'), mime: 'application/vnd.code.notebook.stderr' }], output.cellViewModel);
        createOutputViewModel([{ data: VSBuffer.fromString('text content'), mime: 'text/plain' }], output.cellViewModel);
        createOutputViewModel([{ data: VSBuffer.fromString('non-adjacent'), mime: 'application/vnd.code.notebook.stdout' }], output.cellViewModel);
        await copyCellOutput('application/vnd.code.notebook.stdout', output, clipboard, logService);
        assert.strictEqual(clipboard.clipboardContent, 'stdoutstderr');
    });
    test('error output uses the value in the stack', async () => {
        const clipboard = new ClipboardService();
        const data = VSBuffer.fromString(`{"name":"Error Name","message":"error message","stack":"error stack"}`);
        const output = createOutputViewModel([{ data, mime: 'application/vnd.code.notebook.error' }]);
        await copyCellOutput('application/vnd.code.notebook.error', output, clipboard, logService);
        assert.strictEqual(clipboard.clipboardContent, 'error stack');
    });
    test('error without stack uses the name and message', async () => {
        const clipboard = new ClipboardService();
        const data = VSBuffer.fromString(`{"name":"Error Name","message":"error message"}`);
        const output = createOutputViewModel([{ data, mime: 'application/vnd.code.notebook.error' }]);
        await copyCellOutput('application/vnd.code.notebook.error', output, clipboard, logService);
        assert.strictEqual(clipboard.clipboardContent, 'Error Name: error message');
    });
});
