import { IMouseEvent } from '../../../../base/browser/mouseEvent.js';
import { ActionBar, IActionBarOptions } from '../../../../base/browser/ui/actionbar/actionbar.js';
import { Color } from '../../../../base/common/color.js';
import './media/peekViewWidget.css';
import { ICodeEditor } from '../../../browser/editorBrowser.js';
import { IOptions, IStyles, ZoneWidget } from '../../zoneWidget/browser/zoneWidget.js';
import { RawContextKey } from '../../../../platform/contextkey/common/contextkey.js';
import { IInstantiationService, ServicesAccessor } from '../../../../platform/instantiation/common/instantiation.js';
export declare const IPeekViewService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IPeekViewService>;
export interface IPeekViewService {
    readonly _serviceBrand: undefined;
    addExclusiveWidget(editor: ICodeEditor, widget: PeekViewWidget): void;
}
export declare namespace PeekContext {
    const inPeekEditor: RawContextKey<boolean>;
    const notInPeekEditor: import("../../../../platform/contextkey/common/contextkey.js").ContextKeyExpression;
}
export declare function getOuterEditor(accessor: ServicesAccessor): ICodeEditor | null;
export interface IPeekViewStyles extends IStyles {
    headerBackgroundColor?: Color;
    primaryHeadingColor?: Color;
    secondaryHeadingColor?: Color;
}
export type IPeekViewOptions = IOptions & IPeekViewStyles & {
    supportOnTitleClick?: boolean;
};
export declare abstract class PeekViewWidget extends ZoneWidget {
    protected readonly instantiationService: IInstantiationService;
    readonly _serviceBrand: undefined;
    private readonly _onDidClose;
    readonly onDidClose: import("../../../../base/common/event.js").Event<PeekViewWidget>;
    private disposed?;
    protected _headElement?: HTMLDivElement;
    protected _titleElement?: HTMLDivElement;
    protected _primaryHeading?: HTMLElement;
    protected _secondaryHeading?: HTMLElement;
    protected _metaHeading?: HTMLElement;
    protected _actionbarWidget?: ActionBar;
    protected _bodyElement?: HTMLDivElement;
    constructor(editor: ICodeEditor, options: IPeekViewOptions, instantiationService: IInstantiationService);
    dispose(): void;
    style(styles: IPeekViewStyles): void;
    protected _applyStyles(): void;
    protected _fillContainer(container: HTMLElement): void;
    protected _fillHead(container: HTMLElement, noCloseAction?: boolean): void;
    protected _fillTitleIcon(container: HTMLElement): void;
    protected _getActionBarOptions(): IActionBarOptions;
    protected _onTitleClick(event: IMouseEvent): void;
    setTitle(primaryHeading: string, secondaryHeading?: string): void;
    setMetaTitle(value: string): void;
    protected abstract _fillBody(container: HTMLElement): void;
    protected _doLayout(heightInPixel: number, widthInPixel: number): void;
    protected _doLayoutHead(heightInPixel: number, widthInPixel: number): void;
    protected _doLayoutBody(heightInPixel: number, widthInPixel: number): void;
}
export declare const peekViewTitleBackground: string;
export declare const peekViewTitleForeground: string;
export declare const peekViewTitleInfoForeground: string;
export declare const peekViewBorder: string;
export declare const peekViewResultsBackground: string;
export declare const peekViewResultsMatchForeground: string;
export declare const peekViewResultsFileForeground: string;
export declare const peekViewResultsSelectionBackground: string;
export declare const peekViewResultsSelectionForeground: string;
export declare const peekViewEditorBackground: string;
export declare const peekViewEditorGutterBackground: string;
export declare const peekViewEditorStickyScrollBackground: string;
export declare const peekViewResultsMatchHighlight: string;
export declare const peekViewEditorMatchHighlight: string;
export declare const peekViewEditorMatchHighlightBorder: string;
