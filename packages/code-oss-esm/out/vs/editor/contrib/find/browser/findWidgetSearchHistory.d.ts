import { IHistory } from '../../../../base/common/history.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
export declare class FindWidgetSearchHistory implements IHistory<string> {
    private readonly storageService;
    static readonly FIND_HISTORY_KEY = "workbench.find.history";
    private inMemoryValues;
    constructor(storageService: IStorageService);
    delete(t: string): boolean;
    add(t: string): this;
    has(t: string): boolean;
    clear(): void;
    forEach(callbackfn: (value: string, value2: string, set: Set<string>) => void, thisArg?: any): void;
    replace?(t: string[]): void;
    load(): void;
    save(): Promise<void>;
}
