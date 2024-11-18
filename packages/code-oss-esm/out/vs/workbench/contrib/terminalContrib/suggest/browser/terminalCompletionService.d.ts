import { Disposable, IDisposable } from '../../../../../base/common/lifecycle.js';
import { IConfigurationService } from '../../../../../platform/configuration/common/configuration.js';
import { TerminalShellType } from '../../../../../platform/terminal/common/terminal.js';
import { ISimpleCompletion } from '../../../../services/suggest/browser/simpleCompletionItem.js';
export declare const ITerminalCompletionService: import("../../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<ITerminalCompletionService>;
export declare enum ISimpleCompletionKind {
    File = 0,
    Folder = 1,
    Flag = 2,
    Method = 3
}
export interface ITerminalCompletionProvider {
    shellTypes?: TerminalShellType[];
    provideCompletions(value: string, cursorPosition: number): Promise<ISimpleCompletion[] | undefined>;
    triggerCharacters?: string[];
}
export interface ITerminalCompletionService {
    _serviceBrand: undefined;
    registerTerminalCompletionProvider(extensionIdentifier: string, id: string, provider: ITerminalCompletionProvider, ...triggerCharacters: string[]): IDisposable;
    provideCompletions(promptValue: string, cursorPosition: number, shellType: TerminalShellType): Promise<ISimpleCompletion[] | undefined>;
}
export declare class TerminalCompletionService extends Disposable implements ITerminalCompletionService {
    private readonly _configurationService;
    _serviceBrand: undefined;
    private readonly _providers;
    constructor(_configurationService: IConfigurationService);
    registerTerminalCompletionProvider(extensionIdentifier: string, id: string, provider: ITerminalCompletionProvider, ...triggerCharacters: string[]): IDisposable;
    provideCompletions(promptValue: string, cursorPosition: number, shellType: TerminalShellType): Promise<ISimpleCompletion[] | undefined>;
}
