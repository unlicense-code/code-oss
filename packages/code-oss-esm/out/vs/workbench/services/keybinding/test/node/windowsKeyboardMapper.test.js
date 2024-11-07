/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { KeyChord } from '../../../../../base/common/keyCodes.js';
import { KeyCodeChord, decodeKeybinding, ScanCodeChord, Keybinding } from '../../../../../base/common/keybindings.js';
import { WindowsKeyboardMapper } from '../../common/windowsKeyboardMapper.js';
import { assertMapping, assertResolveKeyboardEvent, assertResolveKeybinding, readRawMapping } from './keyboardMapperTestUtils.js';
import { ensureNoDisposablesAreLeakedInTestSuite } from '../../../../../base/test/common/utils.js';
const WRITE_FILE_IF_DIFFERENT = false;
async function createKeyboardMapper(isUSStandard, file, mapAltGrToCtrlAlt) {
    const rawMappings = await readRawMapping(file);
    return new WindowsKeyboardMapper(isUSStandard, rawMappings, mapAltGrToCtrlAlt);
}
function _assertResolveKeybinding(mapper, k, expected) {
    const keyBinding = decodeKeybinding(k, 1 /* OperatingSystem.Windows */);
    assertResolveKeybinding(mapper, keyBinding, expected);
}
suite('keyboardMapper - WINDOWS de_ch', () => {
    ensureNoDisposablesAreLeakedInTestSuite();
    let mapper;
    suiteSetup(async () => {
        mapper = await createKeyboardMapper(false, 'win_de_ch', false);
    });
    test('mapping', () => {
        return assertMapping(WRITE_FILE_IF_DIFFERENT, mapper, 'win_de_ch.txt');
    });
    test('resolveKeybinding Ctrl+A', () => {
        _assertResolveKeybinding(mapper, 2048 /* KeyMod.CtrlCmd */ | 31 /* KeyCode.KeyA */, [{
                label: 'Ctrl+A',
                ariaLabel: 'Control+A',
                electronAccelerator: 'Ctrl+A',
                userSettingsLabel: 'ctrl+a',
                isWYSIWYG: true,
                isMultiChord: false,
                dispatchParts: ['ctrl+A'],
                singleModifierDispatchParts: [null],
            }]);
    });
    test('resolveKeybinding Ctrl+Z', () => {
        _assertResolveKeybinding(mapper, 2048 /* KeyMod.CtrlCmd */ | 56 /* KeyCode.KeyZ */, [{
                label: 'Ctrl+Z',
                ariaLabel: 'Control+Z',
                electronAccelerator: 'Ctrl+Z',
                userSettingsLabel: 'ctrl+z',
                isWYSIWYG: true,
                isMultiChord: false,
                dispatchParts: ['ctrl+Z'],
                singleModifierDispatchParts: [null],
            }]);
    });
    test('resolveKeyboardEvent Ctrl+Z', () => {
        assertResolveKeyboardEvent(mapper, {
            _standardKeyboardEventBrand: true,
            ctrlKey: true,
            shiftKey: false,
            altKey: false,
            metaKey: false,
            altGraphKey: false,
            keyCode: 56 /* KeyCode.KeyZ */,
            code: null
        }, {
            label: 'Ctrl+Z',
            ariaLabel: 'Control+Z',
            electronAccelerator: 'Ctrl+Z',
            userSettingsLabel: 'ctrl+z',
            isWYSIWYG: true,
            isMultiChord: false,
            dispatchParts: ['ctrl+Z'],
            singleModifierDispatchParts: [null],
        });
    });
    test('resolveKeybinding Ctrl+]', () => {
        _assertResolveKeybinding(mapper, 2048 /* KeyMod.CtrlCmd */ | 94 /* KeyCode.BracketRight */, [{
                label: 'Ctrl+^',
                ariaLabel: 'Control+^',
                electronAccelerator: 'Ctrl+]',
                userSettingsLabel: 'ctrl+oem_6',
                isWYSIWYG: false,
                isMultiChord: false,
                dispatchParts: ['ctrl+]'],
                singleModifierDispatchParts: [null],
            }]);
    });
    test('resolveKeyboardEvent Ctrl+]', () => {
        assertResolveKeyboardEvent(mapper, {
            _standardKeyboardEventBrand: true,
            ctrlKey: true,
            shiftKey: false,
            altKey: false,
            metaKey: false,
            altGraphKey: false,
            keyCode: 94 /* KeyCode.BracketRight */,
            code: null
        }, {
            label: 'Ctrl+^',
            ariaLabel: 'Control+^',
            electronAccelerator: 'Ctrl+]',
            userSettingsLabel: 'ctrl+oem_6',
            isWYSIWYG: false,
            isMultiChord: false,
            dispatchParts: ['ctrl+]'],
            singleModifierDispatchParts: [null],
        });
    });
    test('resolveKeybinding Shift+]', () => {
        _assertResolveKeybinding(mapper, 1024 /* KeyMod.Shift */ | 94 /* KeyCode.BracketRight */, [{
                label: 'Shift+^',
                ariaLabel: 'Shift+^',
                electronAccelerator: 'Shift+]',
                userSettingsLabel: 'shift+oem_6',
                isWYSIWYG: false,
                isMultiChord: false,
                dispatchParts: ['shift+]'],
                singleModifierDispatchParts: [null],
            }]);
    });
    test('resolveKeybinding Ctrl+/', () => {
        _assertResolveKeybinding(mapper, 2048 /* KeyMod.CtrlCmd */ | 90 /* KeyCode.Slash */, [{
                label: 'Ctrl+§',
                ariaLabel: 'Control+§',
                electronAccelerator: 'Ctrl+/',
                userSettingsLabel: 'ctrl+oem_2',
                isWYSIWYG: false,
                isMultiChord: false,
                dispatchParts: ['ctrl+/'],
                singleModifierDispatchParts: [null],
            }]);
    });
    test('resolveKeybinding Ctrl+Shift+/', () => {
        _assertResolveKeybinding(mapper, 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 90 /* KeyCode.Slash */, [{
                label: 'Ctrl+Shift+§',
                ariaLabel: 'Control+Shift+§',
                electronAccelerator: 'Ctrl+Shift+/',
                userSettingsLabel: 'ctrl+shift+oem_2',
                isWYSIWYG: false,
                isMultiChord: false,
                dispatchParts: ['ctrl+shift+/'],
                singleModifierDispatchParts: [null],
            }]);
    });
    test('resolveKeybinding Ctrl+K Ctrl+\\', () => {
        _assertResolveKeybinding(mapper, KeyChord(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 93 /* KeyCode.Backslash */), [{
                label: 'Ctrl+K Ctrl+ä',
                ariaLabel: 'Control+K Control+ä',
                electronAccelerator: null,
                userSettingsLabel: 'ctrl+k ctrl+oem_5',
                isWYSIWYG: false,
                isMultiChord: true,
                dispatchParts: ['ctrl+K', 'ctrl+\\'],
                singleModifierDispatchParts: [null, null],
            }]);
    });
    test('resolveKeybinding Ctrl+K Ctrl+=', () => {
        _assertResolveKeybinding(mapper, KeyChord(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 86 /* KeyCode.Equal */), []);
    });
    test('resolveKeybinding Ctrl+DownArrow', () => {
        _assertResolveKeybinding(mapper, 2048 /* KeyMod.CtrlCmd */ | 18 /* KeyCode.DownArrow */, [{
                label: 'Ctrl+DownArrow',
                ariaLabel: 'Control+DownArrow',
                electronAccelerator: 'Ctrl+Down',
                userSettingsLabel: 'ctrl+down',
                isWYSIWYG: true,
                isMultiChord: false,
                dispatchParts: ['ctrl+DownArrow'],
                singleModifierDispatchParts: [null],
            }]);
    });
    test('resolveKeybinding Ctrl+NUMPAD_0', () => {
        _assertResolveKeybinding(mapper, 2048 /* KeyMod.CtrlCmd */ | 98 /* KeyCode.Numpad0 */, [{
                label: 'Ctrl+NumPad0',
                ariaLabel: 'Control+NumPad0',
                electronAccelerator: null,
                userSettingsLabel: 'ctrl+numpad0',
                isWYSIWYG: true,
                isMultiChord: false,
                dispatchParts: ['ctrl+NumPad0'],
                singleModifierDispatchParts: [null],
            }]);
    });
    test('resolveKeybinding Ctrl+Home', () => {
        _assertResolveKeybinding(mapper, 2048 /* KeyMod.CtrlCmd */ | 14 /* KeyCode.Home */, [{
                label: 'Ctrl+Home',
                ariaLabel: 'Control+Home',
                electronAccelerator: 'Ctrl+Home',
                userSettingsLabel: 'ctrl+home',
                isWYSIWYG: true,
                isMultiChord: false,
                dispatchParts: ['ctrl+Home'],
                singleModifierDispatchParts: [null],
            }]);
    });
    test('resolveKeyboardEvent Ctrl+Home', () => {
        assertResolveKeyboardEvent(mapper, {
            _standardKeyboardEventBrand: true,
            ctrlKey: true,
            shiftKey: false,
            altKey: false,
            metaKey: false,
            altGraphKey: false,
            keyCode: 14 /* KeyCode.Home */,
            code: null
        }, {
            label: 'Ctrl+Home',
            ariaLabel: 'Control+Home',
            electronAccelerator: 'Ctrl+Home',
            userSettingsLabel: 'ctrl+home',
            isWYSIWYG: true,
            isMultiChord: false,
            dispatchParts: ['ctrl+Home'],
            singleModifierDispatchParts: [null],
        });
    });
    test('resolveUserBinding Ctrl+[Comma] Ctrl+/', () => {
        assertResolveKeybinding(mapper, new Keybinding([
            new ScanCodeChord(true, false, false, false, 60 /* ScanCode.Comma */),
            new KeyCodeChord(true, false, false, false, 90 /* KeyCode.Slash */),
        ]), [{
                label: 'Ctrl+, Ctrl+§',
                ariaLabel: 'Control+, Control+§',
                electronAccelerator: null,
                userSettingsLabel: 'ctrl+oem_comma ctrl+oem_2',
                isWYSIWYG: false,
                isMultiChord: true,
                dispatchParts: ['ctrl+,', 'ctrl+/'],
                singleModifierDispatchParts: [null, null],
            }]);
    });
    test('resolveKeyboardEvent Single Modifier Ctrl+', () => {
        assertResolveKeyboardEvent(mapper, {
            _standardKeyboardEventBrand: true,
            ctrlKey: true,
            shiftKey: false,
            altKey: false,
            metaKey: false,
            altGraphKey: false,
            keyCode: 5 /* KeyCode.Ctrl */,
            code: null
        }, {
            label: 'Ctrl',
            ariaLabel: 'Control',
            electronAccelerator: null,
            userSettingsLabel: 'ctrl',
            isWYSIWYG: true,
            isMultiChord: false,
            dispatchParts: [null],
            singleModifierDispatchParts: ['ctrl'],
        });
    });
});
suite('keyboardMapper - WINDOWS en_us', () => {
    ensureNoDisposablesAreLeakedInTestSuite();
    let mapper;
    suiteSetup(async () => {
        mapper = await createKeyboardMapper(true, 'win_en_us', false);
    });
    test('mapping', () => {
        return assertMapping(WRITE_FILE_IF_DIFFERENT, mapper, 'win_en_us.txt');
    });
    test('resolveKeybinding Ctrl+K Ctrl+\\', () => {
        _assertResolveKeybinding(mapper, KeyChord(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 93 /* KeyCode.Backslash */), [{
                label: 'Ctrl+K Ctrl+\\',
                ariaLabel: 'Control+K Control+\\',
                electronAccelerator: null,
                userSettingsLabel: 'ctrl+k ctrl+\\',
                isWYSIWYG: true,
                isMultiChord: true,
                dispatchParts: ['ctrl+K', 'ctrl+\\'],
                singleModifierDispatchParts: [null, null],
            }]);
    });
    test('resolveUserBinding Ctrl+[Comma] Ctrl+/', () => {
        assertResolveKeybinding(mapper, new Keybinding([
            new ScanCodeChord(true, false, false, false, 60 /* ScanCode.Comma */),
            new KeyCodeChord(true, false, false, false, 90 /* KeyCode.Slash */),
        ]), [{
                label: 'Ctrl+, Ctrl+/',
                ariaLabel: 'Control+, Control+/',
                electronAccelerator: null,
                userSettingsLabel: 'ctrl+, ctrl+/',
                isWYSIWYG: true,
                isMultiChord: true,
                dispatchParts: ['ctrl+,', 'ctrl+/'],
                singleModifierDispatchParts: [null, null],
            }]);
    });
    test('resolveUserBinding Ctrl+[Comma]', () => {
        assertResolveKeybinding(mapper, new Keybinding([
            new ScanCodeChord(true, false, false, false, 60 /* ScanCode.Comma */),
        ]), [{
                label: 'Ctrl+,',
                ariaLabel: 'Control+,',
                electronAccelerator: 'Ctrl+,',
                userSettingsLabel: 'ctrl+,',
                isWYSIWYG: true,
                isMultiChord: false,
                dispatchParts: ['ctrl+,'],
                singleModifierDispatchParts: [null],
            }]);
    });
    test('resolveKeyboardEvent Single Modifier Ctrl+', () => {
        assertResolveKeyboardEvent(mapper, {
            _standardKeyboardEventBrand: true,
            ctrlKey: true,
            shiftKey: false,
            altKey: false,
            metaKey: false,
            altGraphKey: false,
            keyCode: 5 /* KeyCode.Ctrl */,
            code: null
        }, {
            label: 'Ctrl',
            ariaLabel: 'Control',
            electronAccelerator: null,
            userSettingsLabel: 'ctrl',
            isWYSIWYG: true,
            isMultiChord: false,
            dispatchParts: [null],
            singleModifierDispatchParts: ['ctrl'],
        });
    });
    test('resolveKeyboardEvent Single Modifier Shift+', () => {
        assertResolveKeyboardEvent(mapper, {
            _standardKeyboardEventBrand: true,
            ctrlKey: false,
            shiftKey: true,
            altKey: false,
            metaKey: false,
            altGraphKey: false,
            keyCode: 4 /* KeyCode.Shift */,
            code: null
        }, {
            label: 'Shift',
            ariaLabel: 'Shift',
            electronAccelerator: null,
            userSettingsLabel: 'shift',
            isWYSIWYG: true,
            isMultiChord: false,
            dispatchParts: [null],
            singleModifierDispatchParts: ['shift'],
        });
    });
    test('resolveKeyboardEvent Single Modifier Alt+', () => {
        assertResolveKeyboardEvent(mapper, {
            _standardKeyboardEventBrand: true,
            ctrlKey: false,
            shiftKey: false,
            altKey: true,
            metaKey: false,
            altGraphKey: false,
            keyCode: 6 /* KeyCode.Alt */,
            code: null
        }, {
            label: 'Alt',
            ariaLabel: 'Alt',
            electronAccelerator: null,
            userSettingsLabel: 'alt',
            isWYSIWYG: true,
            isMultiChord: false,
            dispatchParts: [null],
            singleModifierDispatchParts: ['alt'],
        });
    });
    test('resolveKeyboardEvent Single Modifier Meta+', () => {
        assertResolveKeyboardEvent(mapper, {
            _standardKeyboardEventBrand: true,
            ctrlKey: false,
            shiftKey: false,
            altKey: false,
            metaKey: true,
            altGraphKey: false,
            keyCode: 57 /* KeyCode.Meta */,
            code: null
        }, {
            label: 'Windows',
            ariaLabel: 'Windows',
            electronAccelerator: null,
            userSettingsLabel: 'win',
            isWYSIWYG: true,
            isMultiChord: false,
            dispatchParts: [null],
            singleModifierDispatchParts: ['meta'],
        });
    });
    test('resolveKeyboardEvent Only Modifiers Ctrl+Shift+', () => {
        assertResolveKeyboardEvent(mapper, {
            _standardKeyboardEventBrand: true,
            ctrlKey: true,
            shiftKey: true,
            altKey: false,
            metaKey: false,
            altGraphKey: false,
            keyCode: 4 /* KeyCode.Shift */,
            code: null
        }, {
            label: 'Ctrl+Shift',
            ariaLabel: 'Control+Shift',
            electronAccelerator: null,
            userSettingsLabel: 'ctrl+shift',
            isWYSIWYG: true,
            isMultiChord: false,
            dispatchParts: [null],
            singleModifierDispatchParts: [null],
        });
    });
    test('resolveKeyboardEvent mapAltGrToCtrlAlt AltGr+Z', async () => {
        const mapper = await createKeyboardMapper(true, 'win_en_us', true);
        assertResolveKeyboardEvent(mapper, {
            _standardKeyboardEventBrand: true,
            ctrlKey: false,
            shiftKey: false,
            altKey: false,
            metaKey: false,
            altGraphKey: true,
            keyCode: 56 /* KeyCode.KeyZ */,
            code: null
        }, {
            label: 'Ctrl+Alt+Z',
            ariaLabel: 'Control+Alt+Z',
            electronAccelerator: 'Ctrl+Alt+Z',
            userSettingsLabel: 'ctrl+alt+z',
            isWYSIWYG: true,
            isMultiChord: false,
            dispatchParts: ['ctrl+alt+Z'],
            singleModifierDispatchParts: [null],
        });
    });
});
suite('keyboardMapper - WINDOWS por_ptb', () => {
    ensureNoDisposablesAreLeakedInTestSuite();
    let mapper;
    suiteSetup(async () => {
        mapper = await createKeyboardMapper(false, 'win_por_ptb', false);
    });
    test('mapping', () => {
        return assertMapping(WRITE_FILE_IF_DIFFERENT, mapper, 'win_por_ptb.txt');
    });
    test('resolveKeyboardEvent Ctrl+[IntlRo]', () => {
        assertResolveKeyboardEvent(mapper, {
            _standardKeyboardEventBrand: true,
            ctrlKey: true,
            shiftKey: false,
            altKey: false,
            metaKey: false,
            altGraphKey: false,
            keyCode: 115 /* KeyCode.ABNT_C1 */,
            code: null
        }, {
            label: 'Ctrl+/',
            ariaLabel: 'Control+/',
            electronAccelerator: 'Ctrl+ABNT_C1',
            userSettingsLabel: 'ctrl+abnt_c1',
            isWYSIWYG: false,
            isMultiChord: false,
            dispatchParts: ['ctrl+ABNT_C1'],
            singleModifierDispatchParts: [null],
        });
    });
    test('resolveKeyboardEvent Ctrl+[NumpadComma]', () => {
        assertResolveKeyboardEvent(mapper, {
            _standardKeyboardEventBrand: true,
            ctrlKey: true,
            shiftKey: false,
            altKey: false,
            metaKey: false,
            altGraphKey: false,
            keyCode: 116 /* KeyCode.ABNT_C2 */,
            code: null
        }, {
            label: 'Ctrl+.',
            ariaLabel: 'Control+.',
            electronAccelerator: 'Ctrl+ABNT_C2',
            userSettingsLabel: 'ctrl+abnt_c2',
            isWYSIWYG: false,
            isMultiChord: false,
            dispatchParts: ['ctrl+ABNT_C2'],
            singleModifierDispatchParts: [null],
        });
    });
});
suite('keyboardMapper - WINDOWS ru', () => {
    ensureNoDisposablesAreLeakedInTestSuite();
    let mapper;
    suiteSetup(async () => {
        mapper = await createKeyboardMapper(false, 'win_ru', false);
    });
    test('mapping', () => {
        return assertMapping(WRITE_FILE_IF_DIFFERENT, mapper, 'win_ru.txt');
    });
    test('issue ##24361: resolveKeybinding Ctrl+K Ctrl+K', () => {
        _assertResolveKeybinding(mapper, KeyChord(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */), [{
                label: 'Ctrl+K Ctrl+K',
                ariaLabel: 'Control+K Control+K',
                electronAccelerator: null,
                userSettingsLabel: 'ctrl+k ctrl+k',
                isWYSIWYG: true,
                isMultiChord: true,
                dispatchParts: ['ctrl+K', 'ctrl+K'],
                singleModifierDispatchParts: [null, null],
            }]);
    });
});
suite('keyboardMapper - misc', () => {
    ensureNoDisposablesAreLeakedInTestSuite();
    test('issue #23513: Toggle Sidebar Visibility and Go to Line display same key mapping in Arabic keyboard', () => {
        const mapper = new WindowsKeyboardMapper(false, {
            'KeyB': {
                'vkey': 'VK_B',
                'value': 'لا',
                'withShift': 'لآ',
                'withAltGr': '',
                'withShiftAltGr': ''
            },
            'KeyG': {
                'vkey': 'VK_G',
                'value': 'ل',
                'withShift': 'لأ',
                'withAltGr': '',
                'withShiftAltGr': ''
            }
        }, false);
        _assertResolveKeybinding(mapper, 2048 /* KeyMod.CtrlCmd */ | 32 /* KeyCode.KeyB */, [{
                label: 'Ctrl+B',
                ariaLabel: 'Control+B',
                electronAccelerator: 'Ctrl+B',
                userSettingsLabel: 'ctrl+b',
                isWYSIWYG: true,
                isMultiChord: false,
                dispatchParts: ['ctrl+B'],
                singleModifierDispatchParts: [null],
            }]);
    });
});
