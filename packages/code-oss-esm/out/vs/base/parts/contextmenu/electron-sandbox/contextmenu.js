/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { CONTEXT_MENU_CHANNEL, CONTEXT_MENU_CLOSE_CHANNEL } from '../common/contextmenu.js';
import { ipcRenderer } from '../../sandbox/electron-sandbox/globals.js';
let contextMenuIdPool = 0;
export function popup(items, options, onHide) {
    const processedItems = [];
    const contextMenuId = contextMenuIdPool++;
    const onClickChannel = `vscode:onContextMenu${contextMenuId}`;
    const onClickChannelHandler = (event, itemId, context) => {
        const item = processedItems[itemId];
        item.click?.(context);
    };
    ipcRenderer.once(onClickChannel, onClickChannelHandler);
    ipcRenderer.once(CONTEXT_MENU_CLOSE_CHANNEL, (event, closedContextMenuId) => {
        if (closedContextMenuId !== contextMenuId) {
            return;
        }
        ipcRenderer.removeListener(onClickChannel, onClickChannelHandler);
        onHide?.();
    });
    ipcRenderer.send(CONTEXT_MENU_CHANNEL, contextMenuId, items.map(item => createItem(item, processedItems)), onClickChannel, options);
}
function createItem(item, processedItems) {
    const serializableItem = {
        id: processedItems.length,
        label: item.label,
        type: item.type,
        accelerator: item.accelerator,
        checked: item.checked,
        enabled: typeof item.enabled === 'boolean' ? item.enabled : true,
        visible: typeof item.visible === 'boolean' ? item.visible : true
    };
    processedItems.push(item);
    // Submenu
    if (Array.isArray(item.submenu)) {
        serializableItem.submenu = item.submenu.map(submenuItem => createItem(submenuItem, processedItems));
    }
    return serializableItem;
}
