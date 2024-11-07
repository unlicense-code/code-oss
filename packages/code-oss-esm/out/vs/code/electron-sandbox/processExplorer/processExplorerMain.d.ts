import './media/processExplorer.css';
import '../../../base/browser/ui/codicons/codiconStyles.js';
import { ProcessExplorerWindowConfiguration } from '../../../platform/process/common/process.js';
export interface IProcessExplorerMain {
    startup(configuration: ProcessExplorerWindowConfiguration): void;
}
export declare function startup(configuration: ProcessExplorerWindowConfiguration): void;
