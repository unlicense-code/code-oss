import { ThemeIcon } from '../../../../base/common/themables.js';
import { ILanguageService } from '../../../../editor/common/languages/language.js';
import { IMenuService } from '../../../../platform/actions/common/actions.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IContextKey, IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { IContextMenuService, IContextViewService } from '../../../../platform/contextview/browser/contextView.js';
import { IHoverService } from '../../../../platform/hover/browser/hover.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IKeybindingService } from '../../../../platform/keybinding/common/keybinding.js';
import { ILabelService } from '../../../../platform/label/common/label.js';
import { IOpenerService } from '../../../../platform/opener/common/opener.js';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.js';
import { ViewPane } from '../../../browser/parts/views/viewPane.js';
import { IViewletViewOptions } from '../../../browser/parts/views/viewsViewlet.js';
import { IEditorPane } from '../../../common/editor.js';
import { IViewDescriptorService } from '../../../common/views.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
import { IBreakpoint, IDataBreakpoint, IDebugModel, IDebugService, IExceptionBreakpoint, IFunctionBreakpoint, IInstructionBreakpoint, State } from '../common/debug.js';
export declare function getExpandedBodySize(model: IDebugModel, sessionId: string | undefined, countLimit: number): number;
type BreakpointItem = IBreakpoint | IFunctionBreakpoint | IDataBreakpoint | IExceptionBreakpoint | IInstructionBreakpoint;
interface InputBoxData {
    breakpoint: IFunctionBreakpoint | IExceptionBreakpoint | IDataBreakpoint;
    type: 'condition' | 'hitCount' | 'name';
}
export declare class BreakpointsView extends ViewPane {
    private readonly debugService;
    private readonly editorService;
    private readonly contextViewService;
    private readonly labelService;
    private readonly languageService;
    private list;
    private needsRefresh;
    private needsStateChange;
    private ignoreLayout;
    private menu;
    private breakpointItemType;
    private breakpointIsDataBytes;
    private breakpointHasMultipleModes;
    private breakpointSupportsCondition;
    private _inputBoxData;
    breakpointInputFocused: IContextKey<boolean>;
    private autoFocusedIndex;
    private hintContainer;
    private hintDelayer;
    constructor(options: IViewletViewOptions, contextMenuService: IContextMenuService, debugService: IDebugService, keybindingService: IKeybindingService, instantiationService: IInstantiationService, themeService: IThemeService, editorService: IEditorService, contextViewService: IContextViewService, configurationService: IConfigurationService, viewDescriptorService: IViewDescriptorService, contextKeyService: IContextKeyService, openerService: IOpenerService, telemetryService: ITelemetryService, labelService: ILabelService, menuService: IMenuService, hoverService: IHoverService, languageService: ILanguageService);
    protected renderBody(container: HTMLElement): void;
    protected renderHeaderTitle(container: HTMLElement, title: string): void;
    focus(): void;
    renderInputBox(data: InputBoxData | undefined): void;
    get inputBoxData(): InputBoxData | undefined;
    protected layoutBody(height: number, width: number): void;
    private onListContextMenu;
    private updateSize;
    private updateBreakpointsHint;
    private onBreakpointsChange;
    private onStateChange;
    private get elements();
}
export declare function openBreakpointSource(breakpoint: IBreakpoint, sideBySide: boolean, preserveFocus: boolean, pinned: boolean, debugService: IDebugService, editorService: IEditorService): Promise<IEditorPane | undefined>;
export declare function getBreakpointMessageAndIcon(state: State, breakpointsActivated: boolean, breakpoint: BreakpointItem, labelService: ILabelService, debugModel: IDebugModel): {
    message?: string;
    icon: ThemeIcon;
    showAdapterUnverifiedMessage?: boolean;
};
export {};
