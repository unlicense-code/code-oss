# The ESM Code
the parts inside ./out/ are generated from typescript code-oss/src/*

update ./out
```shell
tsc -p .\src\tsconfig.json --outDir packages/code-oss-esm/out --declaration --target esnext
```


## TODO
Create a rollup config
Create a package.json and a dev bundle


TODO: Create complet list of entrypoints find ./out-vscode-web -name "*.js" > entrypoints.txt
```js
./out-vscode-web/nls.messages.js
./out-vscode-web/vs/editor/common/services/editorSimpleWorkerMain.js
./out-vscode-web/vs/workbench/api/worker/extensionHostWorkerMain.js
./out-vscode-web/vs/workbench/contrib/notebook/common/services/notebookSimpleWorkerMain.js
./out-vscode-web/vs/workbench/contrib/output/common/outputLinkComputerMain.js
./out-vscode-web/vs/workbench/contrib/webview/browser/pre/service-worker.js
./out-vscode-web/vs/workbench/services/keybinding/browser/keyboardLayouts/layout.contribution.darwin.js
./out-vscode-web/vs/workbench/services/keybinding/browser/keyboardLayouts/layout.contribution.linux.js
./out-vscode-web/vs/workbench/services/keybinding/browser/keyboardLayouts/layout.contribution.win.js
./out-vscode-web/vs/workbench/services/languageDetection/browser/languageDetectionSimpleWorkerMain.js
./out-vscode-web/vs/workbench/services/search/worker/localFileSearchMain.js
./out-vscode-web/vs/workbench/services/textMate/browser/backgroundTokenization/worker/textMateTokenizationWorker.workerMain.js
./out-vscode-web/vs/workbench/workbench.web.main.internal.js
./out-vscode-web/vs/workbench/workbench.web.main.js
```
