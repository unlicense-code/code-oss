/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { Disposable, dispose, toDisposable } from '../../../../base/common/lifecycle.js';
import { TerminalCapabilityStore } from '../capabilities/terminalCapabilityStore.js';
import { CommandDetectionCapability } from '../capabilities/commandDetectionCapability.js';
import { CwdDetectionCapability } from '../capabilities/cwdDetectionCapability.js';
import { PartialCommandDetectionCapability } from '../capabilities/partialCommandDetectionCapability.js';
import { Emitter } from '../../../../base/common/event.js';
import { BufferMarkCapability } from '../capabilities/bufferMarkCapability.js';
import { URI } from '../../../../base/common/uri.js';
import { sanitizeCwd } from '../terminalEnvironment.js';
import { removeAnsiEscapeCodesFromPrompt } from '../../../../base/common/strings.js';
/**
 * Shell integration is a feature that enhances the terminal's understanding of what's happening
 * in the shell by injecting special sequences into the shell's prompt using the "Set Text
 * Parameters" sequence (`OSC Ps ; Pt ST`).
 *
 * Definitions:
 * - OSC: `\x1b]`
 * - Ps:  A single (usually optional) numeric parameter, composed of one or more digits.
 * - Pt:  A text parameter composed of printable characters.
 * - ST: `\x7`
 *
 * This is inspired by a feature of the same name in the FinalTerm, iTerm2 and kitty terminals.
 */
/**
 * The identifier for the first numeric parameter (`Ps`) for OSC commands used by shell integration.
 */
export var ShellIntegrationOscPs;
(function (ShellIntegrationOscPs) {
    /**
     * Sequences pioneered by FinalTerm.
     */
    ShellIntegrationOscPs[ShellIntegrationOscPs["FinalTerm"] = 133] = "FinalTerm";
    /**
     * Sequences pioneered by VS Code. The number is derived from the least significant digit of
     * "VSC" when encoded in hex ("VSC" = 0x56, 0x53, 0x43).
     */
    ShellIntegrationOscPs[ShellIntegrationOscPs["VSCode"] = 633] = "VSCode";
    /**
     * Sequences pioneered by iTerm.
     */
    ShellIntegrationOscPs[ShellIntegrationOscPs["ITerm"] = 1337] = "ITerm";
    ShellIntegrationOscPs[ShellIntegrationOscPs["SetCwd"] = 7] = "SetCwd";
    ShellIntegrationOscPs[ShellIntegrationOscPs["SetWindowsFriendlyCwd"] = 9] = "SetWindowsFriendlyCwd";
})(ShellIntegrationOscPs || (ShellIntegrationOscPs = {}));
/**
 * Sequences pioneered by FinalTerm.
 */
var FinalTermOscPt;
(function (FinalTermOscPt) {
    /**
     * The start of the prompt, this is expected to always appear at the start of a line.
     *
     * Format: `OSC 133 ; A ST`
     */
    FinalTermOscPt["PromptStart"] = "A";
    /**
     * The start of a command, ie. where the user inputs their command.
     *
     * Format: `OSC 133 ; B ST`
     */
    FinalTermOscPt["CommandStart"] = "B";
    /**
     * Sent just before the command output begins.
     *
     * Format: `OSC 133 ; C ST`
     */
    FinalTermOscPt["CommandExecuted"] = "C";
    /**
     * Sent just after a command has finished. The exit code is optional, when not specified it
     * means no command was run (ie. enter on empty prompt or ctrl+c).
     *
     * Format: `OSC 133 ; D [; <ExitCode>] ST`
     */
    FinalTermOscPt["CommandFinished"] = "D";
})(FinalTermOscPt || (FinalTermOscPt = {}));
/**
 * VS Code-specific shell integration sequences. Some of these are based on more common alternatives
 * like those pioneered in {@link FinalTermOscPt FinalTerm}. The decision to move to entirely custom
 * sequences was to try to improve reliability and prevent the possibility of applications confusing
 * the terminal. If multiple shell integration scripts run, VS Code will prioritize the VS
 * Code-specific ones.
 *
 * It's recommended that authors of shell integration scripts use the common sequences (`133`)
 * when building general purpose scripts and the VS Code-specific (`633`) when targeting only VS
 * Code or when there are no other alternatives (eg. {@link CommandLine `633 ; E`}). These sequences
 * support mix-and-matching.
 */
var VSCodeOscPt;
(function (VSCodeOscPt) {
    /**
     * The start of the prompt, this is expected to always appear at the start of a line.
     *
     * Format: `OSC 633 ; A ST`
     *
     * Based on {@link FinalTermOscPt.PromptStart}.
     */
    VSCodeOscPt["PromptStart"] = "A";
    /**
     * The start of a command, ie. where the user inputs their command.
     *
     * Format: `OSC 633 ; B ST`
     *
     * Based on  {@link FinalTermOscPt.CommandStart}.
     */
    VSCodeOscPt["CommandStart"] = "B";
    /**
     * Sent just before the command output begins.
     *
     * Format: `OSC 633 ; C ST`
     *
     * Based on {@link FinalTermOscPt.CommandExecuted}.
     */
    VSCodeOscPt["CommandExecuted"] = "C";
    /**
     * Sent just after a command has finished. The exit code is optional, when not specified it
     * means no command was run (ie. enter on empty prompt or ctrl+c).
     *
     * Format: `OSC 633 ; D [; <ExitCode>] ST`
     *
     * Based on {@link FinalTermOscPt.CommandFinished}.
     */
    VSCodeOscPt["CommandFinished"] = "D";
    /**
     * Explicitly set the command line. This helps workaround performance and reliability problems
     * with parsing out the command, such as conpty not guaranteeing the position of the sequence or
     * the shell not guaranteeing that the entire command is even visible. Ideally this is called
     * immediately before {@link CommandExecuted}, immediately before {@link CommandFinished} will
     * also work but that means terminal will only know the accurate command line when the command is
     * finished.
     *
     * The command line can escape ascii characters using the `\xAB` format, where AB are the
     * hexadecimal representation of the character code (case insensitive), and escape the `\`
     * character using `\\`. It's required to escape semi-colon (`0x3b`) and characters 0x20 and
     * below, this is particularly important for new line and semi-colon.
     *
     * Some examples:
     *
     * ```
     * "\"  -> "\\"
     * "\n" -> "\x0a"
     * ";"  -> "\x3b"
     * ```
     *
     * An optional nonce can be provided which is may be required by the terminal in order enable
     * some features. This helps ensure no malicious command injection has occurred.
     *
     * Format: `OSC 633 ; E [; <CommandLine> [; <Nonce>]] ST`
     */
    VSCodeOscPt["CommandLine"] = "E";
    /**
     * Similar to prompt start but for line continuations.
     *
     * WARNING: This sequence is unfinalized, DO NOT use this in your shell integration script.
     */
    VSCodeOscPt["ContinuationStart"] = "F";
    /**
     * Similar to command start but for line continuations.
     *
     * WARNING: This sequence is unfinalized, DO NOT use this in your shell integration script.
     */
    VSCodeOscPt["ContinuationEnd"] = "G";
    /**
     * The start of the right prompt.
     *
     * WARNING: This sequence is unfinalized, DO NOT use this in your shell integration script.
     */
    VSCodeOscPt["RightPromptStart"] = "H";
    /**
     * The end of the right prompt.
     *
     * WARNING: This sequence is unfinalized, DO NOT use this in your shell integration script.
     */
    VSCodeOscPt["RightPromptEnd"] = "I";
    /**
     * Set the value of an arbitrary property, only known properties will be handled by VS Code.
     *
     * Format: `OSC 633 ; P ; <Property>=<Value> ST`
     *
     * Known properties:
     *
     * - `Cwd` - Reports the current working directory to the terminal.
     * - `IsWindows` - Indicates whether the terminal is using a Windows backend like winpty or
     *   conpty. This may be used to enable additional heuristics as the positioning of the shell
     *   integration sequences are not guaranteed to be correct. Valid values: `True`, `False`.
     * - `ContinuationPrompt` - Reports the continuation prompt that is printed at the start of
     *   multi-line inputs.
     *
     * WARNING: Any other properties may be changed and are not guaranteed to work in the future.
     */
    VSCodeOscPt["Property"] = "P";
    /**
     * Sets a mark/point-of-interest in the buffer.
     *
     * Format: `OSC 633 ; SetMark [; Id=<string>] [; Hidden]`
     *
     * `Id` - The identifier of the mark that can be used to reference it
     * `Hidden` - When set, the mark will be available to reference internally but will not visible
     *
     * WARNING: This sequence is unfinalized, DO NOT use this in your shell integration script.
     */
    VSCodeOscPt["SetMark"] = "SetMark";
})(VSCodeOscPt || (VSCodeOscPt = {}));
/**
 * ITerm sequences
 */
var ITermOscPt;
(function (ITermOscPt) {
    /**
     * Sets a mark/point-of-interest in the buffer.
     *
     * Format: `OSC 1337 ; SetMark`
     */
    ITermOscPt["SetMark"] = "SetMark";
    /**
     * Reports current working directory (CWD).
     *
     * Format: `OSC 1337 ; CurrentDir=<Cwd> ST`
     */
    ITermOscPt["CurrentDir"] = "CurrentDir";
})(ITermOscPt || (ITermOscPt = {}));
/**
 * The shell integration addon extends xterm by reading shell integration sequences and creating
 * capabilities and passing along relevant sequences to the capabilities. This is meant to
 * encapsulate all handling/parsing of sequences so the capabilities don't need to.
 */
export class ShellIntegrationAddon extends Disposable {
    get status() { return this._status; }
    constructor(_nonce, _disableTelemetry, _telemetryService, _logService) {
        super();
        this._nonce = _nonce;
        this._disableTelemetry = _disableTelemetry;
        this._telemetryService = _telemetryService;
        this._logService = _logService;
        this.capabilities = this._register(new TerminalCapabilityStore());
        this._hasUpdatedTelemetry = false;
        this._commonProtocolDisposables = [];
        this._status = 0 /* ShellIntegrationStatus.Off */;
        this._onDidChangeStatus = new Emitter();
        this.onDidChangeStatus = this._onDidChangeStatus.event;
        this._register(toDisposable(() => {
            this._clearActivationTimeout();
            this._disposeCommonProtocol();
        }));
    }
    _disposeCommonProtocol() {
        dispose(this._commonProtocolDisposables);
        this._commonProtocolDisposables.length = 0;
    }
    activate(xterm) {
        this._terminal = xterm;
        this.capabilities.add(3 /* TerminalCapability.PartialCommandDetection */, this._register(new PartialCommandDetectionCapability(this._terminal)));
        this._register(xterm.parser.registerOscHandler(633 /* ShellIntegrationOscPs.VSCode */, data => this._handleVSCodeSequence(data)));
        this._register(xterm.parser.registerOscHandler(1337 /* ShellIntegrationOscPs.ITerm */, data => this._doHandleITermSequence(data)));
        this._commonProtocolDisposables.push(xterm.parser.registerOscHandler(133 /* ShellIntegrationOscPs.FinalTerm */, data => this._handleFinalTermSequence(data)));
        this._register(xterm.parser.registerOscHandler(7 /* ShellIntegrationOscPs.SetCwd */, data => this._doHandleSetCwd(data)));
        this._register(xterm.parser.registerOscHandler(9 /* ShellIntegrationOscPs.SetWindowsFriendlyCwd */, data => this._doHandleSetWindowsFriendlyCwd(data)));
        this._ensureCapabilitiesOrAddFailureTelemetry();
    }
    getMarkerId(terminal, vscodeMarkerId) {
        this._createOrGetBufferMarkDetection(terminal).getMark(vscodeMarkerId);
    }
    _handleFinalTermSequence(data) {
        const didHandle = this._doHandleFinalTermSequence(data);
        if (this._status === 0 /* ShellIntegrationStatus.Off */) {
            this._status = 1 /* ShellIntegrationStatus.FinalTerm */;
            this._onDidChangeStatus.fire(this._status);
        }
        return didHandle;
    }
    _doHandleFinalTermSequence(data) {
        if (!this._terminal) {
            return false;
        }
        // Pass the sequence along to the capability
        // It was considered to disable the common protocol in order to not confuse the VS Code
        // shell integration if both happen for some reason. This doesn't work for powerlevel10k
        // when instant prompt is enabled though. If this does end up being a problem we could pass
        // a type flag through the capability calls
        const [command, ...args] = data.split(';');
        switch (command) {
            case "A" /* FinalTermOscPt.PromptStart */:
                this._createOrGetCommandDetection(this._terminal).handlePromptStart();
                return true;
            case "B" /* FinalTermOscPt.CommandStart */:
                // Ignore the command line for these sequences as it's unreliable for example in powerlevel10k
                this._createOrGetCommandDetection(this._terminal).handleCommandStart({ ignoreCommandLine: true });
                return true;
            case "C" /* FinalTermOscPt.CommandExecuted */:
                this._createOrGetCommandDetection(this._terminal).handleCommandExecuted();
                return true;
            case "D" /* FinalTermOscPt.CommandFinished */: {
                const exitCode = args.length === 1 ? parseInt(args[0]) : undefined;
                this._createOrGetCommandDetection(this._terminal).handleCommandFinished(exitCode);
                return true;
            }
        }
        return false;
    }
    _handleVSCodeSequence(data) {
        const didHandle = this._doHandleVSCodeSequence(data);
        if (!this._hasUpdatedTelemetry && didHandle) {
            this._telemetryService?.publicLog2('terminal/shellIntegrationActivationSucceeded');
            this._hasUpdatedTelemetry = true;
            this._clearActivationTimeout();
        }
        if (this._status !== 2 /* ShellIntegrationStatus.VSCode */) {
            this._status = 2 /* ShellIntegrationStatus.VSCode */;
            this._onDidChangeStatus.fire(this._status);
        }
        return didHandle;
    }
    async _ensureCapabilitiesOrAddFailureTelemetry() {
        if (!this._telemetryService || this._disableTelemetry) {
            return;
        }
        this._activationTimeout = setTimeout(() => {
            if (!this.capabilities.get(2 /* TerminalCapability.CommandDetection */) && !this.capabilities.get(0 /* TerminalCapability.CwdDetection */)) {
                this._telemetryService?.publicLog2('terminal/shellIntegrationActivationTimeout');
                this._logService.warn('Shell integration failed to add capabilities within 10 seconds');
            }
            this._hasUpdatedTelemetry = true;
        }, 10000);
    }
    _clearActivationTimeout() {
        if (this._activationTimeout !== undefined) {
            clearTimeout(this._activationTimeout);
            this._activationTimeout = undefined;
        }
    }
    _doHandleVSCodeSequence(data) {
        if (!this._terminal) {
            return false;
        }
        // Pass the sequence along to the capability
        const argsIndex = data.indexOf(';');
        const sequenceCommand = argsIndex === -1 ? data : data.substring(0, argsIndex);
        // Cast to strict checked index access
        const args = argsIndex === -1 ? [] : data.substring(argsIndex + 1).split(';');
        switch (sequenceCommand) {
            case "A" /* VSCodeOscPt.PromptStart */:
                this._createOrGetCommandDetection(this._terminal).handlePromptStart();
                return true;
            case "B" /* VSCodeOscPt.CommandStart */:
                this._createOrGetCommandDetection(this._terminal).handleCommandStart();
                return true;
            case "C" /* VSCodeOscPt.CommandExecuted */:
                this._createOrGetCommandDetection(this._terminal).handleCommandExecuted();
                return true;
            case "D" /* VSCodeOscPt.CommandFinished */: {
                const arg0 = args[0];
                const exitCode = arg0 !== undefined ? parseInt(arg0) : undefined;
                this._createOrGetCommandDetection(this._terminal).handleCommandFinished(exitCode);
                return true;
            }
            case "E" /* VSCodeOscPt.CommandLine */: {
                const arg0 = args[0];
                const arg1 = args[1];
                let commandLine;
                if (arg0 !== undefined) {
                    commandLine = deserializeMessage(arg0);
                }
                else {
                    commandLine = '';
                }
                this._createOrGetCommandDetection(this._terminal).setCommandLine(commandLine, arg1 === this._nonce);
                return true;
            }
            case "F" /* VSCodeOscPt.ContinuationStart */: {
                this._createOrGetCommandDetection(this._terminal).handleContinuationStart();
                return true;
            }
            case "G" /* VSCodeOscPt.ContinuationEnd */: {
                this._createOrGetCommandDetection(this._terminal).handleContinuationEnd();
                return true;
            }
            case "H" /* VSCodeOscPt.RightPromptStart */: {
                this._createOrGetCommandDetection(this._terminal).handleRightPromptStart();
                return true;
            }
            case "I" /* VSCodeOscPt.RightPromptEnd */: {
                this._createOrGetCommandDetection(this._terminal).handleRightPromptEnd();
                return true;
            }
            case "P" /* VSCodeOscPt.Property */: {
                const arg0 = args[0];
                const deserialized = arg0 !== undefined ? deserializeMessage(arg0) : '';
                const { key, value } = parseKeyValueAssignment(deserialized);
                if (value === undefined) {
                    return true;
                }
                switch (key) {
                    case 'ContinuationPrompt': {
                        this._updateContinuationPrompt(removeAnsiEscapeCodesFromPrompt(value));
                        return true;
                    }
                    case 'Cwd': {
                        this._updateCwd(value);
                        return true;
                    }
                    case 'IsWindows': {
                        this._createOrGetCommandDetection(this._terminal).setIsWindowsPty(value === 'True' ? true : false);
                        return true;
                    }
                    case 'Prompt': {
                        // Remove escape sequences from the user's prompt
                        const sanitizedValue = value.replace(/\x1b\[[0-9;]*m/g, '');
                        this._updatePromptTerminator(sanitizedValue);
                        return true;
                    }
                    case 'Task': {
                        this._createOrGetBufferMarkDetection(this._terminal);
                        this.capabilities.get(2 /* TerminalCapability.CommandDetection */)?.setIsCommandStorageDisabled();
                        return true;
                    }
                }
            }
            case "SetMark" /* VSCodeOscPt.SetMark */: {
                this._createOrGetBufferMarkDetection(this._terminal).addMark(parseMarkSequence(args));
                return true;
            }
        }
        // Unrecognized sequence
        return false;
    }
    _updateContinuationPrompt(value) {
        if (!this._terminal) {
            return;
        }
        this._createOrGetCommandDetection(this._terminal).setContinuationPrompt(value);
    }
    _updatePromptTerminator(prompt) {
        if (!this._terminal) {
            return;
        }
        const lastPromptLine = prompt.substring(prompt.lastIndexOf('\n') + 1);
        const promptTerminator = lastPromptLine.substring(lastPromptLine.lastIndexOf(' '));
        if (promptTerminator) {
            this._createOrGetCommandDetection(this._terminal).setPromptTerminator(promptTerminator, lastPromptLine);
        }
    }
    _updateCwd(value) {
        value = sanitizeCwd(value);
        this._createOrGetCwdDetection().updateCwd(value);
        const commandDetection = this.capabilities.get(2 /* TerminalCapability.CommandDetection */);
        commandDetection?.setCwd(value);
    }
    _doHandleITermSequence(data) {
        if (!this._terminal) {
            return false;
        }
        const [command] = data.split(';');
        switch (command) {
            case "SetMark" /* ITermOscPt.SetMark */: {
                this._createOrGetBufferMarkDetection(this._terminal).addMark();
            }
            default: {
                // Checking for known `<key>=<value>` pairs.
                // Note that unlike `VSCodeOscPt.Property`, iTerm2 does not interpret backslash or hex-escape sequences.
                // See: https://github.com/gnachman/iTerm2/blob/bb0882332cec5196e4de4a4225978d746e935279/sources/VT100Terminal.m#L2089-L2105
                const { key, value } = parseKeyValueAssignment(command);
                if (value === undefined) {
                    // No '=' was found, so it's not a property assignment.
                    return true;
                }
                switch (key) {
                    case "CurrentDir" /* ITermOscPt.CurrentDir */:
                        // Encountered: `OSC 1337 ; CurrentDir=<Cwd> ST`
                        this._updateCwd(value);
                        return true;
                }
            }
        }
        // Unrecognized sequence
        return false;
    }
    _doHandleSetWindowsFriendlyCwd(data) {
        if (!this._terminal) {
            return false;
        }
        const [command, ...args] = data.split(';');
        switch (command) {
            case '9':
                // Encountered `OSC 9 ; 9 ; <cwd> ST`
                if (args.length) {
                    this._updateCwd(args[0]);
                }
                return true;
        }
        // Unrecognized sequence
        return false;
    }
    /**
     * Handles the sequence: `OSC 7 ; scheme://cwd ST`
     */
    _doHandleSetCwd(data) {
        if (!this._terminal) {
            return false;
        }
        const [command] = data.split(';');
        if (command.match(/^file:\/\/.*\//)) {
            const uri = URI.parse(command);
            if (uri.path && uri.path.length > 0) {
                this._updateCwd(uri.path);
                return true;
            }
        }
        // Unrecognized sequence
        return false;
    }
    serialize() {
        if (!this._terminal || !this.capabilities.has(2 /* TerminalCapability.CommandDetection */)) {
            return {
                isWindowsPty: false,
                commands: [],
                promptInputModel: undefined,
            };
        }
        const result = this._createOrGetCommandDetection(this._terminal).serialize();
        return result;
    }
    deserialize(serialized) {
        if (!this._terminal) {
            throw new Error('Cannot restore commands before addon is activated');
        }
        this._createOrGetCommandDetection(this._terminal).deserialize(serialized);
    }
    _createOrGetCwdDetection() {
        let cwdDetection = this.capabilities.get(0 /* TerminalCapability.CwdDetection */);
        if (!cwdDetection) {
            cwdDetection = this._register(new CwdDetectionCapability());
            this.capabilities.add(0 /* TerminalCapability.CwdDetection */, cwdDetection);
        }
        return cwdDetection;
    }
    _createOrGetCommandDetection(terminal) {
        let commandDetection = this.capabilities.get(2 /* TerminalCapability.CommandDetection */);
        if (!commandDetection) {
            commandDetection = this._register(new CommandDetectionCapability(terminal, this._logService));
            this.capabilities.add(2 /* TerminalCapability.CommandDetection */, commandDetection);
        }
        return commandDetection;
    }
    _createOrGetBufferMarkDetection(terminal) {
        let bufferMarkDetection = this.capabilities.get(4 /* TerminalCapability.BufferMarkDetection */);
        if (!bufferMarkDetection) {
            bufferMarkDetection = this._register(new BufferMarkCapability(terminal));
            this.capabilities.add(4 /* TerminalCapability.BufferMarkDetection */, bufferMarkDetection);
        }
        return bufferMarkDetection;
    }
}
export function deserializeMessage(message) {
    return message.replaceAll(
    // Backslash ('\') followed by an escape operator: either another '\', or 'x' and two hex chars.
    /\\(\\|x([0-9a-f]{2}))/gi, 
    // If it's a hex value, parse it to a character.
    // Otherwise the operator is '\', which we return literally, now unescaped.
    (_match, op, hex) => hex ? String.fromCharCode(parseInt(hex, 16)) : op);
}
export function parseKeyValueAssignment(message) {
    const separatorIndex = message.indexOf('=');
    if (separatorIndex === -1) {
        return { key: message, value: undefined }; // No '=' was found.
    }
    return {
        key: message.substring(0, separatorIndex),
        value: message.substring(1 + separatorIndex)
    };
}
export function parseMarkSequence(sequence) {
    let id = undefined;
    let hidden = false;
    for (const property of sequence) {
        // Sanity check, this shouldn't happen in practice
        if (property === undefined) {
            continue;
        }
        if (property === 'Hidden') {
            hidden = true;
        }
        if (property.startsWith('Id=')) {
            id = property.substring(3);
        }
    }
    return { id, hidden };
}
