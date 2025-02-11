import { Disposable } from '../../../../../../base/common/lifecycle.js';
import { IObservable } from '../../../../../../base/common/observable.js';
import { IInstantiationService } from '../../../../../../platform/instantiation/common/instantiation.js';
import { ICodeEditor } from '../../../../../browser/editorBrowser.js';
import './inlineEditsView.css';
import { OriginalEditorInlineDiffView } from './inlineDiffView.js';
import { InlineEditsIndicator } from './inlineEditsIndicatorView.js';
import { CustomizedMenuWorkbenchToolBar } from '../../hintsWidget/inlineCompletionsHintsWidget.js';
import { ICommandService } from '../../../../../../platform/commands/common/commands.js';
import { InlineCompletionsModel } from '../../model/inlineCompletionsModel.js';
import { InlineEditWithChanges } from './inlineEditsViewAndDiffProducer.js';
export declare const originalBackgroundColor: string;
export declare const modifiedBackgroundColor: string;
export declare const border: string;
export declare class InlineEditsView extends Disposable {
    private readonly _editor;
    private readonly _edit;
    private readonly _model;
    private readonly _instantiationService;
    private readonly _commandService;
    private readonly _editorObs;
    private readonly _elements;
    private readonly _useMixedLinesDiff;
    private readonly _useInterleavedLinesDiff;
    constructor(_editor: ICodeEditor, _edit: IObservable<InlineEditWithChanges | undefined>, _model: IObservable<InlineCompletionsModel | undefined>, _instantiationService: IInstantiationService, _commandService: ICommandService);
    private readonly _uiState;
    protected readonly _toolbar: CustomizedMenuWorkbenchToolBar;
    private readonly _extraCommands;
    protected readonly _updateToolbarAutorun: import("../../../../../../base/common/lifecycle.js").IDisposable;
    private readonly _previewTextModel;
    private readonly _previewEditor;
    private readonly _previewEditorObs;
    private readonly _previewEditorRootVisibility;
    private readonly _updatePreviewEditorRootVisibility;
    private readonly _updatePreviewEditor;
    private readonly _previewEditorWidth;
    private readonly _previewEditorLeft;
    /**
     * ![test](./layout.dio.svg)
    */
    private readonly _previewEditorLayoutInfo;
    private readonly _inlineDiffViewState;
    protected readonly _inlineDiffView: OriginalEditorInlineDiffView;
    protected readonly _indicator: InlineEditsIndicator;
}
