import { Event } from '../../../base/common/event.js';
import { URI, UriComponents } from '../../../base/common/uri.js';
import { IEnvironmentService } from '../../environment/common/environment.js';
export declare const IWorkspaceContextService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IWorkspaceContextService>;
export interface IWorkspaceContextService {
    readonly _serviceBrand: undefined;
    /**
     * An event which fires on workbench state changes.
     */
    readonly onDidChangeWorkbenchState: Event<WorkbenchState>;
    /**
     * An event which fires on workspace name changes.
     */
    readonly onDidChangeWorkspaceName: Event<void>;
    /**
     * An event which fires before workspace folders change.
     */
    readonly onWillChangeWorkspaceFolders: Event<IWorkspaceFoldersWillChangeEvent>;
    /**
     * An event which fires on workspace folders change.
     */
    readonly onDidChangeWorkspaceFolders: Event<IWorkspaceFoldersChangeEvent>;
    /**
     * Provides access to the complete workspace object.
     */
    getCompleteWorkspace(): Promise<IWorkspace>;
    /**
     * Provides access to the workspace object the window is running with.
     * Use `getCompleteWorkspace` to get complete workspace object.
     */
    getWorkspace(): IWorkspace;
    /**
     * Return the state of the workbench.
     *
     * WorkbenchState.EMPTY - if the workbench was opened with empty window or file
     * WorkbenchState.FOLDER - if the workbench was opened with a folder
     * WorkbenchState.WORKSPACE - if the workbench was opened with a workspace
     */
    getWorkbenchState(): WorkbenchState;
    /**
     * Returns the folder for the given resource from the workspace.
     * Can be null if there is no workspace or the resource is not inside the workspace.
     */
    getWorkspaceFolder(resource: URI): IWorkspaceFolder | null;
    /**
     * Return `true` if the current workspace has the given identifier or root URI otherwise `false`.
     */
    isCurrentWorkspace(workspaceIdOrFolder: IWorkspaceIdentifier | ISingleFolderWorkspaceIdentifier | URI): boolean;
    /**
     * Returns if the provided resource is inside the workspace or not.
     */
    isInsideWorkspace(resource: URI): boolean;
}
export interface IResolvedWorkspace extends IWorkspaceIdentifier, IBaseWorkspace {
    readonly folders: IWorkspaceFolder[];
}
export interface IBaseWorkspace {
    /**
     * If present, marks the window that opens the workspace
     * as a remote window with the given authority.
     */
    readonly remoteAuthority?: string;
    /**
     * Transient workspaces are meant to go away after being used
     * once, e.g. a window reload of a transient workspace will
     * open an empty window.
     *
     * See: https://github.com/microsoft/vscode/issues/119695
     */
    readonly transient?: boolean;
}
export interface IBaseWorkspaceIdentifier {
    /**
     * Every workspace (multi-root, single folder or empty)
     * has a unique identifier. It is not possible to open
     * a workspace with the same `id` in multiple windows
     */
    readonly id: string;
}
/**
 * A single folder workspace identifier is a path to a folder + id.
 */
export interface ISingleFolderWorkspaceIdentifier extends IBaseWorkspaceIdentifier {
    /**
     * Folder path as `URI`.
     */
    readonly uri: URI;
}
/**
 * A multi-root workspace identifier is a path to a workspace file + id.
 */
export interface IWorkspaceIdentifier extends IBaseWorkspaceIdentifier {
    /**
     * Workspace config file path as `URI`.
     */
    configPath: URI;
}
export interface IEmptyWorkspaceIdentifier extends IBaseWorkspaceIdentifier {
}
export type IAnyWorkspaceIdentifier = IWorkspaceIdentifier | ISingleFolderWorkspaceIdentifier | IEmptyWorkspaceIdentifier;
export declare function isSingleFolderWorkspaceIdentifier(obj: unknown): obj is ISingleFolderWorkspaceIdentifier;
export declare function isEmptyWorkspaceIdentifier(obj: unknown): obj is IEmptyWorkspaceIdentifier;
export declare const EXTENSION_DEVELOPMENT_EMPTY_WINDOW_WORKSPACE: IEmptyWorkspaceIdentifier;
export declare const UNKNOWN_EMPTY_WINDOW_WORKSPACE: IEmptyWorkspaceIdentifier;
export declare function toWorkspaceIdentifier(workspace: IWorkspace): IAnyWorkspaceIdentifier;
export declare function toWorkspaceIdentifier(backupPath: string | undefined, isExtensionDevelopment: boolean): IEmptyWorkspaceIdentifier;
export declare function isWorkspaceIdentifier(obj: unknown): obj is IWorkspaceIdentifier;
export interface ISerializedSingleFolderWorkspaceIdentifier extends IBaseWorkspaceIdentifier {
    readonly uri: UriComponents;
}
export interface ISerializedWorkspaceIdentifier extends IBaseWorkspaceIdentifier {
    readonly configPath: UriComponents;
}
export declare function reviveIdentifier(identifier: undefined): undefined;
export declare function reviveIdentifier(identifier: ISerializedWorkspaceIdentifier): IWorkspaceIdentifier;
export declare function reviveIdentifier(identifier: ISerializedSingleFolderWorkspaceIdentifier): ISingleFolderWorkspaceIdentifier;
export declare function reviveIdentifier(identifier: IEmptyWorkspaceIdentifier): IEmptyWorkspaceIdentifier;
export declare function reviveIdentifier(identifier: ISerializedWorkspaceIdentifier | ISerializedSingleFolderWorkspaceIdentifier | IEmptyWorkspaceIdentifier | undefined): IAnyWorkspaceIdentifier | undefined;
export declare const enum WorkbenchState {
    EMPTY = 1,
    FOLDER = 2,
    WORKSPACE = 3
}
export interface IWorkspaceFoldersWillChangeEvent {
    readonly changes: IWorkspaceFoldersChangeEvent;
    readonly fromCache: boolean;
    join(promise: Promise<void>): void;
}
export interface IWorkspaceFoldersChangeEvent {
    added: IWorkspaceFolder[];
    removed: IWorkspaceFolder[];
    changed: IWorkspaceFolder[];
}
export interface IWorkspace {
    /**
     * the unique identifier of the workspace.
     */
    readonly id: string;
    /**
     * Folders in the workspace.
     */
    readonly folders: IWorkspaceFolder[];
    /**
     * Transient workspaces are meant to go away after being used
     * once, e.g. a window reload of a transient workspace will
     * open an empty window.
     */
    readonly transient?: boolean;
    /**
     * the location of the workspace configuration
     */
    readonly configuration?: URI | null;
}
export declare function isWorkspace(thing: unknown): thing is IWorkspace;
export interface IWorkspaceFolderData {
    /**
     * The associated URI for this workspace folder.
     */
    readonly uri: URI;
    /**
     * The name of this workspace folder. Defaults to
     * the basename of its [uri-path](#Uri.path)
     */
    readonly name: string;
    /**
     * The ordinal number of this workspace folder.
     */
    readonly index: number;
}
export interface IWorkspaceFolder extends IWorkspaceFolderData {
    /**
     * Given workspace folder relative path, returns the resource with the absolute path.
     */
    toResource: (relativePath: string) => URI;
}
export declare function isWorkspaceFolder(thing: unknown): thing is IWorkspaceFolder;
export declare class Workspace implements IWorkspace {
    private _id;
    private _transient;
    private _configuration;
    private _ignorePathCasing;
    private _foldersMap;
    private _folders;
    constructor(_id: string, folders: WorkspaceFolder[], _transient: boolean, _configuration: URI | null, _ignorePathCasing: (key: URI) => boolean);
    update(workspace: Workspace): void;
    get folders(): WorkspaceFolder[];
    set folders(folders: WorkspaceFolder[]);
    get id(): string;
    get transient(): boolean;
    get configuration(): URI | null;
    set configuration(configuration: URI | null);
    getFolder(resource: URI): IWorkspaceFolder | null;
    private updateFoldersMap;
    toJSON(): IWorkspace;
}
export interface IRawFileWorkspaceFolder {
    readonly path: string;
    name?: string;
}
export interface IRawUriWorkspaceFolder {
    readonly uri: string;
    name?: string;
}
export declare class WorkspaceFolder implements IWorkspaceFolder {
    /**
     * Provides access to the original metadata for this workspace
     * folder. This can be different from the metadata provided in
     * this class:
     * - raw paths can be relative
     * - raw paths are not normalized
     */
    readonly raw?: (IRawFileWorkspaceFolder | IRawUriWorkspaceFolder) | undefined;
    readonly uri: URI;
    readonly name: string;
    readonly index: number;
    constructor(data: IWorkspaceFolderData, 
    /**
     * Provides access to the original metadata for this workspace
     * folder. This can be different from the metadata provided in
     * this class:
     * - raw paths can be relative
     * - raw paths are not normalized
     */
    raw?: (IRawFileWorkspaceFolder | IRawUriWorkspaceFolder) | undefined);
    toResource(relativePath: string): URI;
    toJSON(): IWorkspaceFolderData;
}
export declare function toWorkspaceFolder(resource: URI): WorkspaceFolder;
export declare const WORKSPACE_EXTENSION = "code-workspace";
export declare const WORKSPACE_SUFFIX = ".code-workspace";
export declare const WORKSPACE_FILTER: {
    name: string;
    extensions: string[];
}[];
export declare const UNTITLED_WORKSPACE_NAME = "workspace.json";
export declare function isUntitledWorkspace(path: URI, environmentService: IEnvironmentService): boolean;
export declare function isTemporaryWorkspace(workspace: IWorkspace): boolean;
export declare function isTemporaryWorkspace(path: URI): boolean;
export declare const STANDALONE_EDITOR_WORKSPACE_ID = "4064f6ec-cb38-4ad0-af64-ee6467e63c82";
export declare function isStandaloneEditorWorkspace(workspace: IWorkspace): boolean;
export declare function isSavedWorkspace(path: URI, environmentService: IEnvironmentService): boolean;
export declare function hasWorkspaceFileExtension(path: string | URI): boolean;
