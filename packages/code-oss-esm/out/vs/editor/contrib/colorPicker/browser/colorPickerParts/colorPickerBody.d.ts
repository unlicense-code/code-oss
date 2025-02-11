import '../colorPicker.css';
import { Disposable } from '../../../../../base/common/lifecycle.js';
import { ColorPickerModel } from '../colorPickerModel.js';
import { SaturationBox } from './colorPickerSaturationBox.js';
import { InsertButton } from './colorPickerInsertButton.js';
import { Strip } from './colorPickerStrip.js';
import { ColorPickerWidgetType } from '../colorPickerParticipantUtils.js';
export declare class ColorPickerBody extends Disposable {
    private readonly model;
    private pixelRatio;
    private readonly _domNode;
    private readonly _saturationBox;
    private readonly _hueStrip;
    private readonly _opacityStrip;
    private readonly _insertButton;
    constructor(container: HTMLElement, model: ColorPickerModel, pixelRatio: number, type: ColorPickerWidgetType);
    private flushColor;
    private onDidSaturationValueChange;
    private onDidOpacityChange;
    private onDidHueChange;
    get domNode(): HTMLElement;
    get saturationBox(): SaturationBox;
    get opacityStrip(): Strip;
    get hueStrip(): Strip;
    get enterButton(): InsertButton | null;
    layout(): void;
}
