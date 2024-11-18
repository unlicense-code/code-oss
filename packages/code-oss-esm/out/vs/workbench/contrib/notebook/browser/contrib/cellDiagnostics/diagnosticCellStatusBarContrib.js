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
import { Disposable } from '../../../../../../base/common/lifecycle.js';
import { autorun } from '../../../../../../base/common/observable.js';
import { localize } from '../../../../../../nls.js';
import { IInstantiationService } from '../../../../../../platform/instantiation/common/instantiation.js';
import { EXPLAIN_CELL_ERROR_COMMAND_ID, FIX_CELL_ERROR_COMMAND_ID } from './cellDiagnosticsActions.js';
import { NotebookStatusBarController } from '../cellStatusBar/executionStatusBarItemController.js';
import { registerNotebookContribution } from '../../notebookEditorExtensions.js';
import { CodeCellViewModel } from '../../viewModel/codeCellViewModel.js';
let DiagnosticCellStatusBarContrib = class DiagnosticCellStatusBarContrib extends Disposable {
    static { this.id = 'workbench.notebook.statusBar.diagtnostic'; }
    constructor(notebookEditor, instantiationService) {
        super();
        this._register(new NotebookStatusBarController(notebookEditor, (vm, cell) => cell instanceof CodeCellViewModel ?
            instantiationService.createInstance(DiagnosticCellStatusBarItem, vm, cell) :
            Disposable.None));
    }
};
DiagnosticCellStatusBarContrib = __decorate([
    __param(1, IInstantiationService)
], DiagnosticCellStatusBarContrib);
export { DiagnosticCellStatusBarContrib };
registerNotebookContribution(DiagnosticCellStatusBarContrib.id, DiagnosticCellStatusBarContrib);
class DiagnosticCellStatusBarItem extends Disposable {
    constructor(_notebookViewModel, cell) {
        super();
        this._notebookViewModel = _notebookViewModel;
        this.cell = cell;
        this._currentItemIds = [];
        this._register(autorun((reader) => this.updateQuickActions(reader.readObservable(cell.executionError))));
    }
    async updateQuickActions(error) {
        let items = [];
        if (error?.location) {
            items = [{
                    text: `$(sparkle) fix`,
                    tooltip: localize('notebook.cell.status.fix', 'Fix With Inline Chat'),
                    alignment: 1 /* CellStatusbarAlignment.Left */,
                    command: FIX_CELL_ERROR_COMMAND_ID,
                    priority: Number.MAX_SAFE_INTEGER - 1
                }, {
                    text: `$(sparkle) explain`,
                    tooltip: localize('notebook.cell.status.explain', 'Explain With Chat'),
                    alignment: 1 /* CellStatusbarAlignment.Left */,
                    command: EXPLAIN_CELL_ERROR_COMMAND_ID,
                    priority: Number.MAX_SAFE_INTEGER - 1
                }];
        }
        this._currentItemIds = this._notebookViewModel.deltaCellStatusBarItems(this._currentItemIds, [{ handle: this.cell.handle, items }]);
    }
    dispose() {
        super.dispose();
        this._notebookViewModel.deltaCellStatusBarItems(this._currentItemIds, [{ handle: this.cell.handle, items: [] }]);
    }
}
