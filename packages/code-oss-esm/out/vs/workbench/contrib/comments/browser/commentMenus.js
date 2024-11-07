/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { IMenuService, MenuId } from '../../../../platform/actions/common/actions.js';
let CommentMenus = class CommentMenus {
    constructor(menuService) {
        this.menuService = menuService;
    }
    getCommentThreadTitleActions(contextKeyService) {
        return this.getMenu(MenuId.CommentThreadTitle, contextKeyService);
    }
    getCommentThreadActions(contextKeyService) {
        return this.getMenu(MenuId.CommentThreadActions, contextKeyService);
    }
    getCommentEditorActions(contextKeyService) {
        return this.getMenu(MenuId.CommentEditorActions, contextKeyService);
    }
    getCommentThreadAdditionalActions(contextKeyService) {
        return this.getMenu(MenuId.CommentThreadAdditionalActions, contextKeyService, { emitEventsForSubmenuChanges: true });
    }
    getCommentTitleActions(comment, contextKeyService) {
        return this.getMenu(MenuId.CommentTitle, contextKeyService);
    }
    getCommentActions(comment, contextKeyService) {
        return this.getMenu(MenuId.CommentActions, contextKeyService);
    }
    getCommentThreadTitleContextActions(contextKeyService) {
        return this.getMenu(MenuId.CommentThreadTitleContext, contextKeyService);
    }
    getMenu(menuId, contextKeyService, options) {
        return this.menuService.createMenu(menuId, contextKeyService, options);
    }
    dispose() {
    }
};
CommentMenus = __decorate([
    __param(0, IMenuService)
], CommentMenus);
export { CommentMenus };
