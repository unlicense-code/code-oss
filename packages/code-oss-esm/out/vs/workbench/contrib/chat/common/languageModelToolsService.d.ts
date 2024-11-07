import { CancellationToken } from '../../../../base/common/cancellation.js';
import { Event } from '../../../../base/common/event.js';
import { IMarkdownString } from '../../../../base/common/htmlContent.js';
import { IJSONSchema } from '../../../../base/common/jsonSchema.js';
import { IDisposable } from '../../../../base/common/lifecycle.js';
import { ThemeIcon } from '../../../../base/common/themables.js';
import { URI } from '../../../../base/common/uri.js';
import { ContextKeyExpression } from '../../../../platform/contextkey/common/contextkey.js';
export interface IToolData {
    id: string;
    toolReferenceName?: string;
    icon?: {
        dark: URI;
        light?: URI;
    } | ThemeIcon;
    when?: ContextKeyExpression;
    tags?: string[];
    displayName: string;
    userDescription?: string;
    modelDescription: string;
    inputSchema?: IJSONSchema;
    canBeReferencedInPrompt?: boolean;
}
export interface IToolInvocation {
    callId: string;
    toolId: string;
    parameters: Object;
    tokenBudget?: number;
    context: IToolInvocationContext | undefined;
}
export interface IToolInvocationContext {
    sessionId: string;
}
export declare function isToolInvocationContext(obj: any): obj is IToolInvocationContext;
export interface IToolResult {
    content: (IToolResultPromptTsxPart | IToolResultTextPart)[];
}
export interface IToolResultPromptTsxPart {
    kind: 'promptTsx';
    value: unknown;
}
export interface IToolResultTextPart {
    kind: 'text';
    value: string;
}
export interface IToolConfirmationMessages {
    title: string;
    message: string | IMarkdownString;
}
export interface IPreparedToolInvocation {
    invocationMessage?: string;
    confirmationMessages?: IToolConfirmationMessages;
}
export interface IToolImpl {
    invoke(invocation: IToolInvocation, countTokens: CountTokensCallback, token: CancellationToken): Promise<IToolResult>;
    prepareToolInvocation?(parameters: any, token: CancellationToken): Promise<IPreparedToolInvocation | undefined>;
}
export declare const ILanguageModelToolsService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<ILanguageModelToolsService>;
export type CountTokensCallback = (input: string, token: CancellationToken) => Promise<number>;
export interface ILanguageModelToolsService {
    _serviceBrand: undefined;
    onDidChangeTools: Event<void>;
    registerToolData(toolData: IToolData): IDisposable;
    registerToolImplementation(id: string, tool: IToolImpl): IDisposable;
    getTools(): Iterable<Readonly<IToolData>>;
    getTool(id: string): IToolData | undefined;
    getToolByName(name: string): IToolData | undefined;
    invokeTool(invocation: IToolInvocation, countTokens: CountTokensCallback, token: CancellationToken): Promise<IToolResult>;
}
