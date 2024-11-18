import { IListAccessibilityProvider } from '../../../../base/browser/ui/list/listWidget.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IKeybindingService } from '../../../../platform/keybinding/common/keybinding.js';
import { AccessibilityVerbositySettingId } from '../../accessibility/browser/accessibilityConfiguration.js';
import { CellViewModel, NotebookViewModel } from './viewModel/notebookViewModelImpl.js';
import { INotebookExecutionStateService } from '../common/notebookExecutionStateService.js';
import { IAccessibilityService } from '../../../../platform/accessibility/common/accessibility.js';
export declare class NotebookAccessibilityProvider extends Disposable implements IListAccessibilityProvider<CellViewModel> {
    private readonly viewModel;
    private readonly isReplHistory;
    private readonly notebookExecutionStateService;
    private readonly keybindingService;
    private readonly configurationService;
    private readonly accessibilityService;
    private readonly _onDidAriaLabelChange;
    private readonly onDidAriaLabelChange;
    constructor(viewModel: () => NotebookViewModel | undefined, isReplHistory: boolean, notebookExecutionStateService: INotebookExecutionStateService, keybindingService: IKeybindingService, configurationService: IConfigurationService, accessibilityService: IAccessibilityService);
    private shouldReadCellOutputs;
    get verbositySettingId(): AccessibilityVerbositySettingId.Notebook | AccessibilityVerbositySettingId.ReplEditor;
    getAriaLabel(element: CellViewModel): import("../../../../base/common/observable.js").IObservable<string, unknown>;
    private createItemLabel;
    private getLabel;
    private get widgetAriaLabelName();
    getWidgetAriaLabel(): string;
    private mergeEvents;
}
