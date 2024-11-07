import { URI } from '../../../../base/common/uri.js';
import { IRange } from '../../../../editor/common/core/range.js';
import { IChatProgressRenderableResponseContent, IChatProgressResponseContent } from './chatModel.js';
import { IChatMarkdownContent } from './chatService.js';
export declare const contentRefUrl = "http://_vscodecontentref_";
export declare function annotateSpecialMarkdownContent(response: Iterable<IChatProgressResponseContent>): IChatProgressRenderableResponseContent[];
export interface IMarkdownVulnerability {
    readonly title: string;
    readonly description: string;
    readonly range: IRange;
}
export declare function annotateVulnerabilitiesInText(response: ReadonlyArray<IChatProgressResponseContent>): readonly IChatMarkdownContent[];
export declare function extractCodeblockUrisFromText(text: string): {
    uri: URI;
    textWithoutResult: string;
} | undefined;
export declare function extractVulnerabilitiesFromText(text: string): {
    newText: string;
    vulnerabilities: IMarkdownVulnerability[];
};
