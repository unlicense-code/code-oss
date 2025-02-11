import { Disposable } from '../../../../../base/common/lifecycle.js';
import { ICommandService } from '../../../../../platform/commands/common/commands.js';
import { IContextKeyService } from '../../../../../platform/contextkey/common/contextkey.js';
import { ITerminalInstance, IXtermTerminal } from '../../../terminal/browser/terminal.js';
import type { Terminal } from '@xterm/xterm';
import { IConfigurationService } from '../../../../../platform/configuration/common/configuration.js';
import { IAccessibleViewContentProvider, AccessibleViewProviderId, IAccessibleViewOptions } from '../../../../../platform/accessibility/browser/accessibleView.js';
import { AccessibilityVerbositySettingId } from '../../../accessibility/browser/accessibilityConfiguration.js';
export declare const enum ClassName {
    Active = "active",
    EditorTextArea = "textarea"
}
export declare class TerminalAccessibilityHelpProvider extends Disposable implements IAccessibleViewContentProvider {
    private readonly _instance;
    private readonly _commandService;
    private readonly _configurationService;
    private readonly _contextKeyService;
    id: AccessibleViewProviderId;
    private readonly _hasShellIntegration;
    onClose(): void;
    options: IAccessibleViewOptions;
    verbositySettingKey: AccessibilityVerbositySettingId;
    constructor(_instance: Pick<ITerminalInstance, 'shellType' | 'capabilities' | 'onDidRequestFocus' | 'resource' | 'focus'>, _xterm: Pick<IXtermTerminal, 'getFont' | 'shellIntegration'> & {
        raw: Terminal;
    }, _commandService: ICommandService, _configurationService: IConfigurationService, _contextKeyService: IContextKeyService);
    provideContent(): string;
}
