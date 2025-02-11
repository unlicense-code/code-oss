import './media/breakpointWidget.css';
import { ICodeEditor } from '../../../../editor/browser/editorBrowser.js';
import { ICodeEditorService } from '../../../../editor/browser/services/codeEditorService.js';
import { IPosition } from '../../../../editor/common/core/position.js';
import { IRange } from '../../../../editor/common/core/range.js';
import { ILanguageFeaturesService } from '../../../../editor/common/services/languageFeatures.js';
import { IModelService } from '../../../../editor/common/services/model.js';
import { ITextModelService } from '../../../../editor/common/services/resolverService.js';
import { ZoneWidget } from '../../../../editor/contrib/zoneWidget/browser/zoneWidget.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { IContextViewService } from '../../../../platform/contextview/browser/contextView.js';
import { IHoverService } from '../../../../platform/hover/browser/hover.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IKeybindingService } from '../../../../platform/keybinding/common/keybinding.js';
import { ILabelService } from '../../../../platform/label/common/label.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.js';
import { BreakpointWidgetContext as Context, IDebugService } from '../common/debug.js';
declare const IPrivateBreakpointWidgetService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IPrivateBreakpointWidgetService>;
interface IPrivateBreakpointWidgetService {
    readonly _serviceBrand: undefined;
    close(success: boolean): void;
}
export declare class BreakpointWidget extends ZoneWidget implements IPrivateBreakpointWidgetService {
    private lineNumber;
    private column;
    private readonly contextViewService;
    private readonly debugService;
    private readonly themeService;
    private readonly contextKeyService;
    private readonly instantiationService;
    private readonly modelService;
    private readonly codeEditorService;
    private readonly _configurationService;
    private readonly languageFeaturesService;
    private readonly keybindingService;
    private readonly labelService;
    private readonly textModelService;
    private readonly hoverService;
    readonly _serviceBrand: undefined;
    private selectContainer;
    private inputContainer;
    private selectBreakpointContainer;
    private input;
    private selectBreakpointBox;
    private selectModeBox?;
    private toDispose;
    private conditionInput;
    private hitCountInput;
    private logMessageInput;
    private modeInput?;
    private breakpoint;
    private context;
    private heightInPx;
    private triggeredByBreakpointInput;
    constructor(editor: ICodeEditor, lineNumber: number, column: number | undefined, context: Context | undefined, contextViewService: IContextViewService, debugService: IDebugService, themeService: IThemeService, contextKeyService: IContextKeyService, instantiationService: IInstantiationService, modelService: IModelService, codeEditorService: ICodeEditorService, _configurationService: IConfigurationService, languageFeaturesService: ILanguageFeaturesService, keybindingService: IKeybindingService, labelService: ILabelService, textModelService: ITextModelService, hoverService: IHoverService);
    private get placeholder();
    private getInputValue;
    private rememberInput;
    private setInputMode;
    show(rangeOrPos: IRange | IPosition): void;
    fitHeightToContent(): void;
    protected _fillContainer(container: HTMLElement): void;
    private createModesInput;
    private createTriggerBreakpointInput;
    private updateContextInput;
    protected _doLayout(heightInPixel: number, widthInPixel: number): void;
    protected _onWidth(widthInPixel: number): void;
    private createBreakpointInput;
    private createEditorOptions;
    private centerInputVertically;
    close(success: boolean): void;
    private focusInput;
    dispose(): void;
}
export {};
