import { INotificationService, INotification, INotificationHandle, Severity, NotificationMessage, IPromptChoice, IPromptOptions, IStatusMessageOptions, NotificationsFilter, INotificationSource, INotificationSourceFilter } from '../../../../platform/notification/common/notification.js';
import { NotificationsModel } from '../../../common/notifications.js';
import { Disposable, IDisposable } from '../../../../base/common/lifecycle.js';
import { Event } from '../../../../base/common/event.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
export declare class NotificationService extends Disposable implements INotificationService {
    private readonly storageService;
    readonly _serviceBrand: undefined;
    readonly model: NotificationsModel;
    private readonly _onDidAddNotification;
    readonly onDidAddNotification: Event<INotification>;
    private readonly _onDidRemoveNotification;
    readonly onDidRemoveNotification: Event<INotification>;
    constructor(storageService: IStorageService);
    private registerListeners;
    private static readonly GLOBAL_FILTER_SETTINGS_KEY;
    private static readonly PER_SOURCE_FILTER_SETTINGS_KEY;
    private readonly _onDidChangeFilter;
    readonly onDidChangeFilter: Event<void>;
    private globalFilterEnabled;
    private readonly mapSourceToFilter;
    setFilter(filter: NotificationsFilter | INotificationSourceFilter): void;
    getFilter(source?: INotificationSource): NotificationsFilter;
    private updateSourceFilter;
    private saveSourceFilters;
    getFilters(): INotificationSourceFilter[];
    private updateFilters;
    removeFilter(sourceId: string): void;
    info(message: NotificationMessage | NotificationMessage[]): void;
    warn(message: NotificationMessage | NotificationMessage[]): void;
    error(message: NotificationMessage | NotificationMessage[]): void;
    notify(notification: INotification): INotificationHandle;
    private toStorageScope;
    prompt(severity: Severity, message: string, choices: IPromptChoice[], options?: IPromptOptions): INotificationHandle;
    status(message: NotificationMessage, options?: IStatusMessageOptions): IDisposable;
}
