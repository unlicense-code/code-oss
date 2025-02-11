/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import assert from 'assert';
import { Part } from '../../browser/part.js';
import { isEmptyObject } from '../../../base/common/types.js';
import { TestThemeService } from '../../../platform/theme/test/common/testThemeService.js';
import { append, $, hide } from '../../../base/browser/dom.js';
import { TestLayoutService } from './workbenchTestServices.js';
import { TestStorageService } from '../common/workbenchTestServices.js';
import { ensureNoDisposablesAreLeakedInTestSuite } from '../../../base/test/common/utils.js';
import { DisposableStore } from '../../../base/common/lifecycle.js';
import { mainWindow } from '../../../base/browser/window.js';
suite('Workbench parts', () => {
    const disposables = new DisposableStore();
    class SimplePart extends Part {
        constructor() {
            super(...arguments);
            this.minimumWidth = 50;
            this.maximumWidth = 50;
            this.minimumHeight = 50;
            this.maximumHeight = 50;
        }
        layout(width, height) {
            throw new Error('Method not implemented.');
        }
        toJSON() {
            throw new Error('Method not implemented.');
        }
    }
    class MyPart extends SimplePart {
        constructor(expectedParent) {
            super('myPart', { hasTitle: true }, new TestThemeService(), disposables.add(new TestStorageService()), new TestLayoutService());
            this.expectedParent = expectedParent;
        }
        createTitleArea(parent) {
            assert.strictEqual(parent, this.expectedParent);
            return super.createTitleArea(parent);
        }
        createContentArea(parent) {
            assert.strictEqual(parent, this.expectedParent);
            return super.createContentArea(parent);
        }
        testGetMemento(scope, target) {
            return super.getMemento(scope, target);
        }
        testSaveState() {
            return super.saveState();
        }
    }
    class MyPart2 extends SimplePart {
        constructor() {
            super('myPart2', { hasTitle: true }, new TestThemeService(), disposables.add(new TestStorageService()), new TestLayoutService());
        }
        createTitleArea(parent) {
            const titleContainer = append(parent, $('div'));
            const titleLabel = append(titleContainer, $('span'));
            titleLabel.id = 'myPart.title';
            titleLabel.innerText = 'Title';
            return titleContainer;
        }
        createContentArea(parent) {
            const contentContainer = append(parent, $('div'));
            const contentSpan = append(contentContainer, $('span'));
            contentSpan.id = 'myPart.content';
            contentSpan.innerText = 'Content';
            return contentContainer;
        }
    }
    class MyPart3 extends SimplePart {
        constructor() {
            super('myPart2', { hasTitle: false }, new TestThemeService(), disposables.add(new TestStorageService()), new TestLayoutService());
        }
        createTitleArea(parent) {
            return null;
        }
        createContentArea(parent) {
            const contentContainer = append(parent, $('div'));
            const contentSpan = append(contentContainer, $('span'));
            contentSpan.id = 'myPart.content';
            contentSpan.innerText = 'Content';
            return contentContainer;
        }
    }
    let fixture;
    const fixtureId = 'workbench-part-fixture';
    setup(() => {
        fixture = document.createElement('div');
        fixture.id = fixtureId;
        mainWindow.document.body.appendChild(fixture);
    });
    teardown(() => {
        fixture.remove();
        disposables.clear();
    });
    test('Creation', () => {
        const b = document.createElement('div');
        mainWindow.document.getElementById(fixtureId).appendChild(b);
        hide(b);
        let part = disposables.add(new MyPart(b));
        part.create(b);
        assert.strictEqual(part.getId(), 'myPart');
        // Memento
        let memento = part.testGetMemento(0 /* StorageScope.PROFILE */, 1 /* StorageTarget.MACHINE */);
        assert(memento);
        memento.foo = 'bar';
        memento.bar = [1, 2, 3];
        part.testSaveState();
        // Re-Create to assert memento contents
        part = disposables.add(new MyPart(b));
        memento = part.testGetMemento(0 /* StorageScope.PROFILE */, 1 /* StorageTarget.MACHINE */);
        assert(memento);
        assert.strictEqual(memento.foo, 'bar');
        assert.strictEqual(memento.bar.length, 3);
        // Empty Memento stores empty object
        delete memento.foo;
        delete memento.bar;
        part.testSaveState();
        part = disposables.add(new MyPart(b));
        memento = part.testGetMemento(0 /* StorageScope.PROFILE */, 1 /* StorageTarget.MACHINE */);
        assert(memento);
        assert.strictEqual(isEmptyObject(memento), true);
    });
    test('Part Layout with Title and Content', function () {
        const b = document.createElement('div');
        mainWindow.document.getElementById(fixtureId).appendChild(b);
        hide(b);
        const part = disposables.add(new MyPart2());
        part.create(b);
        assert(mainWindow.document.getElementById('myPart.title'));
        assert(mainWindow.document.getElementById('myPart.content'));
    });
    test('Part Layout with Content only', function () {
        const b = document.createElement('div');
        mainWindow.document.getElementById(fixtureId).appendChild(b);
        hide(b);
        const part = disposables.add(new MyPart3());
        part.create(b);
        assert(!mainWindow.document.getElementById('myPart.title'));
        assert(mainWindow.document.getElementById('myPart.content'));
    });
    ensureNoDisposablesAreLeakedInTestSuite();
});
