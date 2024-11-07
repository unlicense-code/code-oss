import { Disposable } from '../../../../base/common/lifecycle.js';
import { URI } from '../../../../base/common/uri.js';
import { IRange } from '../../../../editor/common/core/range.js';
import { IChatRequestVariableEntry } from '../common/chatModel.js';
export declare class ChatAttachmentModel extends Disposable {
    private _attachments;
    get attachments(): ReadonlyArray<IChatRequestVariableEntry>;
    private _onDidChangeContext;
    readonly onDidChangeContext: import("../../../../base/common/event.js").Event<void>;
    get size(): number;
    getAttachmentIDs(): Set<string>;
    clear(): void;
    delete(variableEntryId: string): void;
    addFile(uri: URI, range?: IRange): void;
    asVariableEntry(uri: URI, range?: IRange): {
        value: URI | {
            uri: URI;
            range: IRange;
        };
        id: string;
        name: string;
        isFile: boolean;
        isDynamic: boolean;
    };
    addContext(...attachments: IChatRequestVariableEntry[]): void;
    clearAndSetContext(...attachments: IChatRequestVariableEntry[]): void;
}
