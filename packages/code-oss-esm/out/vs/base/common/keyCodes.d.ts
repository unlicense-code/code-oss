/**
 * Virtual Key Codes, the value does not hold any inherent meaning.
 * Inspired somewhat from https://msdn.microsoft.com/en-us/library/windows/desktop/dd375731(v=vs.85).aspx
 * But these are "more general", as they should work across browsers & OS`s.
 */
export declare const enum KeyCode {
    DependsOnKbLayout = -1,
    /**
     * Placed first to cover the 0 value of the enum.
     */
    Unknown = 0,
    Backspace = 1,
    Tab = 2,
    Enter = 3,
    Shift = 4,
    Ctrl = 5,
    Alt = 6,
    PauseBreak = 7,
    CapsLock = 8,
    Escape = 9,
    Space = 10,
    PageUp = 11,
    PageDown = 12,
    End = 13,
    Home = 14,
    LeftArrow = 15,
    UpArrow = 16,
    RightArrow = 17,
    DownArrow = 18,
    Insert = 19,
    Delete = 20,
    Digit0 = 21,
    Digit1 = 22,
    Digit2 = 23,
    Digit3 = 24,
    Digit4 = 25,
    Digit5 = 26,
    Digit6 = 27,
    Digit7 = 28,
    Digit8 = 29,
    Digit9 = 30,
    KeyA = 31,
    KeyB = 32,
    KeyC = 33,
    KeyD = 34,
    KeyE = 35,
    KeyF = 36,
    KeyG = 37,
    KeyH = 38,
    KeyI = 39,
    KeyJ = 40,
    KeyK = 41,
    KeyL = 42,
    KeyM = 43,
    KeyN = 44,
    KeyO = 45,
    KeyP = 46,
    KeyQ = 47,
    KeyR = 48,
    KeyS = 49,
    KeyT = 50,
    KeyU = 51,
    KeyV = 52,
    KeyW = 53,
    KeyX = 54,
    KeyY = 55,
    KeyZ = 56,
    Meta = 57,
    ContextMenu = 58,
    F1 = 59,
    F2 = 60,
    F3 = 61,
    F4 = 62,
    F5 = 63,
    F6 = 64,
    F7 = 65,
    F8 = 66,
    F9 = 67,
    F10 = 68,
    F11 = 69,
    F12 = 70,
    F13 = 71,
    F14 = 72,
    F15 = 73,
    F16 = 74,
    F17 = 75,
    F18 = 76,
    F19 = 77,
    F20 = 78,
    F21 = 79,
    F22 = 80,
    F23 = 81,
    F24 = 82,
    NumLock = 83,
    ScrollLock = 84,
    /**
     * Used for miscellaneous characters; it can vary by keyboard.
     * For the US standard keyboard, the ';:' key
     */
    Semicolon = 85,
    /**
     * For any country/region, the '+' key
     * For the US standard keyboard, the '=+' key
     */
    Equal = 86,
    /**
     * For any country/region, the ',' key
     * For the US standard keyboard, the ',<' key
     */
    Comma = 87,
    /**
     * For any country/region, the '-' key
     * For the US standard keyboard, the '-_' key
     */
    Minus = 88,
    /**
     * For any country/region, the '.' key
     * For the US standard keyboard, the '.>' key
     */
    Period = 89,
    /**
     * Used for miscellaneous characters; it can vary by keyboard.
     * For the US standard keyboard, the '/?' key
     */
    Slash = 90,
    /**
     * Used for miscellaneous characters; it can vary by keyboard.
     * For the US standard keyboard, the '`~' key
     */
    Backquote = 91,
    /**
     * Used for miscellaneous characters; it can vary by keyboard.
     * For the US standard keyboard, the '[{' key
     */
    BracketLeft = 92,
    /**
     * Used for miscellaneous characters; it can vary by keyboard.
     * For the US standard keyboard, the '\|' key
     */
    Backslash = 93,
    /**
     * Used for miscellaneous characters; it can vary by keyboard.
     * For the US standard keyboard, the ']}' key
     */
    BracketRight = 94,
    /**
     * Used for miscellaneous characters; it can vary by keyboard.
     * For the US standard keyboard, the ''"' key
     */
    Quote = 95,
    /**
     * Used for miscellaneous characters; it can vary by keyboard.
     */
    OEM_8 = 96,
    /**
     * Either the angle bracket key or the backslash key on the RT 102-key keyboard.
     */
    IntlBackslash = 97,
    Numpad0 = 98,// VK_NUMPAD0, 0x60, Numeric keypad 0 key
    Numpad1 = 99,// VK_NUMPAD1, 0x61, Numeric keypad 1 key
    Numpad2 = 100,// VK_NUMPAD2, 0x62, Numeric keypad 2 key
    Numpad3 = 101,// VK_NUMPAD3, 0x63, Numeric keypad 3 key
    Numpad4 = 102,// VK_NUMPAD4, 0x64, Numeric keypad 4 key
    Numpad5 = 103,// VK_NUMPAD5, 0x65, Numeric keypad 5 key
    Numpad6 = 104,// VK_NUMPAD6, 0x66, Numeric keypad 6 key
    Numpad7 = 105,// VK_NUMPAD7, 0x67, Numeric keypad 7 key
    Numpad8 = 106,// VK_NUMPAD8, 0x68, Numeric keypad 8 key
    Numpad9 = 107,// VK_NUMPAD9, 0x69, Numeric keypad 9 key
    NumpadMultiply = 108,// VK_MULTIPLY, 0x6A, Multiply key
    NumpadAdd = 109,// VK_ADD, 0x6B, Add key
    NUMPAD_SEPARATOR = 110,// VK_SEPARATOR, 0x6C, Separator key
    NumpadSubtract = 111,// VK_SUBTRACT, 0x6D, Subtract key
    NumpadDecimal = 112,// VK_DECIMAL, 0x6E, Decimal key
    NumpadDivide = 113,// VK_DIVIDE, 0x6F,
    /**
     * Cover all key codes when IME is processing input.
     */
    KEY_IN_COMPOSITION = 114,
    ABNT_C1 = 115,// Brazilian (ABNT) Keyboard
    ABNT_C2 = 116,// Brazilian (ABNT) Keyboard
    AudioVolumeMute = 117,
    AudioVolumeUp = 118,
    AudioVolumeDown = 119,
    BrowserSearch = 120,
    BrowserHome = 121,
    BrowserBack = 122,
    BrowserForward = 123,
    MediaTrackNext = 124,
    MediaTrackPrevious = 125,
    MediaStop = 126,
    MediaPlayPause = 127,
    LaunchMediaPlayer = 128,
    LaunchMail = 129,
    LaunchApp2 = 130,
    /**
     * VK_CLEAR, 0x0C, CLEAR key
     */
    Clear = 131,
    /**
     * Placed last to cover the length of the enum.
     * Please do not depend on this value!
     */
    MAX_VALUE = 132
}
/**
 * keyboardEvent.code
 */
export declare const enum ScanCode {
    DependsOnKbLayout = -1,
    None = 0,
    Hyper = 1,
    Super = 2,
    Fn = 3,
    FnLock = 4,
    Suspend = 5,
    Resume = 6,
    Turbo = 7,
    Sleep = 8,
    WakeUp = 9,
    KeyA = 10,
    KeyB = 11,
    KeyC = 12,
    KeyD = 13,
    KeyE = 14,
    KeyF = 15,
    KeyG = 16,
    KeyH = 17,
    KeyI = 18,
    KeyJ = 19,
    KeyK = 20,
    KeyL = 21,
    KeyM = 22,
    KeyN = 23,
    KeyO = 24,
    KeyP = 25,
    KeyQ = 26,
    KeyR = 27,
    KeyS = 28,
    KeyT = 29,
    KeyU = 30,
    KeyV = 31,
    KeyW = 32,
    KeyX = 33,
    KeyY = 34,
    KeyZ = 35,
    Digit1 = 36,
    Digit2 = 37,
    Digit3 = 38,
    Digit4 = 39,
    Digit5 = 40,
    Digit6 = 41,
    Digit7 = 42,
    Digit8 = 43,
    Digit9 = 44,
    Digit0 = 45,
    Enter = 46,
    Escape = 47,
    Backspace = 48,
    Tab = 49,
    Space = 50,
    Minus = 51,
    Equal = 52,
    BracketLeft = 53,
    BracketRight = 54,
    Backslash = 55,
    IntlHash = 56,
    Semicolon = 57,
    Quote = 58,
    Backquote = 59,
    Comma = 60,
    Period = 61,
    Slash = 62,
    CapsLock = 63,
    F1 = 64,
    F2 = 65,
    F3 = 66,
    F4 = 67,
    F5 = 68,
    F6 = 69,
    F7 = 70,
    F8 = 71,
    F9 = 72,
    F10 = 73,
    F11 = 74,
    F12 = 75,
    PrintScreen = 76,
    ScrollLock = 77,
    Pause = 78,
    Insert = 79,
    Home = 80,
    PageUp = 81,
    Delete = 82,
    End = 83,
    PageDown = 84,
    ArrowRight = 85,
    ArrowLeft = 86,
    ArrowDown = 87,
    ArrowUp = 88,
    NumLock = 89,
    NumpadDivide = 90,
    NumpadMultiply = 91,
    NumpadSubtract = 92,
    NumpadAdd = 93,
    NumpadEnter = 94,
    Numpad1 = 95,
    Numpad2 = 96,
    Numpad3 = 97,
    Numpad4 = 98,
    Numpad5 = 99,
    Numpad6 = 100,
    Numpad7 = 101,
    Numpad8 = 102,
    Numpad9 = 103,
    Numpad0 = 104,
    NumpadDecimal = 105,
    IntlBackslash = 106,
    ContextMenu = 107,
    Power = 108,
    NumpadEqual = 109,
    F13 = 110,
    F14 = 111,
    F15 = 112,
    F16 = 113,
    F17 = 114,
    F18 = 115,
    F19 = 116,
    F20 = 117,
    F21 = 118,
    F22 = 119,
    F23 = 120,
    F24 = 121,
    Open = 122,
    Help = 123,
    Select = 124,
    Again = 125,
    Undo = 126,
    Cut = 127,
    Copy = 128,
    Paste = 129,
    Find = 130,
    AudioVolumeMute = 131,
    AudioVolumeUp = 132,
    AudioVolumeDown = 133,
    NumpadComma = 134,
    IntlRo = 135,
    KanaMode = 136,
    IntlYen = 137,
    Convert = 138,
    NonConvert = 139,
    Lang1 = 140,
    Lang2 = 141,
    Lang3 = 142,
    Lang4 = 143,
    Lang5 = 144,
    Abort = 145,
    Props = 146,
    NumpadParenLeft = 147,
    NumpadParenRight = 148,
    NumpadBackspace = 149,
    NumpadMemoryStore = 150,
    NumpadMemoryRecall = 151,
    NumpadMemoryClear = 152,
    NumpadMemoryAdd = 153,
    NumpadMemorySubtract = 154,
    NumpadClear = 155,
    NumpadClearEntry = 156,
    ControlLeft = 157,
    ShiftLeft = 158,
    AltLeft = 159,
    MetaLeft = 160,
    ControlRight = 161,
    ShiftRight = 162,
    AltRight = 163,
    MetaRight = 164,
    BrightnessUp = 165,
    BrightnessDown = 166,
    MediaPlay = 167,
    MediaRecord = 168,
    MediaFastForward = 169,
    MediaRewind = 170,
    MediaTrackNext = 171,
    MediaTrackPrevious = 172,
    MediaStop = 173,
    Eject = 174,
    MediaPlayPause = 175,
    MediaSelect = 176,
    LaunchMail = 177,
    LaunchApp2 = 178,
    LaunchApp1 = 179,
    SelectTask = 180,
    LaunchScreenSaver = 181,
    BrowserSearch = 182,
    BrowserHome = 183,
    BrowserBack = 184,
    BrowserForward = 185,
    BrowserStop = 186,
    BrowserRefresh = 187,
    BrowserFavorites = 188,
    ZoomToggle = 189,
    MailReply = 190,
    MailForward = 191,
    MailSend = 192,
    MAX_VALUE = 193
}
export declare const EVENT_KEY_CODE_MAP: {
    [keyCode: number]: KeyCode;
};
export declare const NATIVE_WINDOWS_KEY_CODE_TO_KEY_CODE: {
    [nativeKeyCode: string]: KeyCode;
};
export declare const ScanCodeUtils: {
    lowerCaseToEnum: (scanCode: string) => number;
    toEnum: (scanCode: string) => number;
    toString: (scanCode: ScanCode) => string;
};
/**
 * -1 if a ScanCode => KeyCode mapping depends on kb layout.
 */
export declare const IMMUTABLE_CODE_TO_KEY_CODE: KeyCode[];
/**
 * -1 if a KeyCode => ScanCode mapping depends on kb layout.
 */
export declare const IMMUTABLE_KEY_CODE_TO_CODE: ScanCode[];
export declare namespace KeyCodeUtils {
    function toString(keyCode: KeyCode): string;
    function fromString(key: string): KeyCode;
    function toUserSettingsUS(keyCode: KeyCode): string;
    function toUserSettingsGeneral(keyCode: KeyCode): string;
    function fromUserSettings(key: string): KeyCode;
    function toElectronAccelerator(keyCode: KeyCode): string | null;
}
export declare const enum KeyMod {
    CtrlCmd = 2048,
    Shift = 1024,
    Alt = 512,
    WinCtrl = 256
}
export declare function KeyChord(firstPart: number, secondPart: number): number;
