import './media/typeHierarchy.css';
import { ICodeEditor } from '../../../../editor/browser/editorBrowser.js';
import { IPosition } from '../../../../editor/common/core/position.js';
import { ITextModelService } from '../../../../editor/common/services/resolverService.js';
import * as peekView from '../../../../editor/contrib/peekView/browser/peekView.js';
import { IMenuService, MenuId } from '../../../../platform/actions/common/actions.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.js';
import * as typeHTree from './typeHierarchyTree.js';
import { TypeHierarchyDirection, TypeHierarchyModel } from '../common/typeHierarchy.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
export declare class TypeHierarchyTreePeekWidget extends peekView.PeekViewWidget {
    private readonly _where;
    private _direction;
    private readonly _peekViewService;
    private readonly _editorService;
    private readonly _textModelService;
    private readonly _storageService;
    private readonly _menuService;
    private readonly _contextKeyService;
    private readonly _instantiationService;
    static readonly TitleMenu: MenuId;
    private _parent;
    private _message;
    private _splitView;
    private _tree;
    private _treeViewStates;
    private _editor;
    private _dim;
    private _layoutInfo;
    private readonly _previewDisposable;
    constructor(editor: ICodeEditor, _where: IPosition, _direction: TypeHierarchyDirection, themeService: IThemeService, _peekViewService: peekView.IPeekViewService, _editorService: IEditorService, _textModelService: ITextModelService, _storageService: IStorageService, _menuService: IMenuService, _contextKeyService: IContextKeyService, _instantiationService: IInstantiationService);
    dispose(): void;
    get direction(): TypeHierarchyDirection;
    private _applyTheme;
    protected _fillHead(container: HTMLElement): void;
    protected _fillBody(parent: HTMLElement): void;
    private _updatePreview;
    showLoading(): void;
    showMessage(message: string): void;
    showModel(model: TypeHierarchyModel): Promise<void>;
    getModel(): TypeHierarchyModel | undefined;
    getFocused(): typeHTree.Type | undefined;
    updateDirection(newDirection: TypeHierarchyDirection): Promise<void>;
    private _show;
    protected _onWidth(width: number): void;
    protected _doLayoutBody(height: number, width: number): void;
}
