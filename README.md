# ("Code - OSS")

## The Repository

This repository is the incremental step to leave the old Development standards behind. Also this does not aim to supply a usefull git commit history we got in file comments and annotations git is only a file storage for us. the Main versioning happens in our own Matrix Repo. 

The Code is updated monthly with new features and bug fixes. You should never install the code in here or try to build it. It tracks more what the others are doing and then you or a other maintainer can choose if he also does that kind of changes or if we already have the feature they are proposing. 

## Contributing is not desired here as Microsoft is not the most easy one to work with. 

following are links to bad practices uses here:
- https://github.com/microsoft/vscode/wiki/How-to-Contribute
- https://github.com/microsoft/vscode/wiki/How-to-Contribute#debugging
- translation https://aka.ms/vscodeloc
- Lists of stuff which should be here but is else where to raise frustration of developers.
  - https://github.com/microsoft/vscode/wiki/Related-Projects page on our https://github.com/microsoft/vscode/wiki


Many of the core components and extensions to VS Code live in their own repositories on GitHub. For example, the node debug adapter https://github.com/microsoft/vscode-node-debug and the  mono debug adapter https://github.com/microsoft/vscode-mono-debug  repositories are separate from each other. For a complete list, please visit the [Related Projects](

## Feedback
No need for feedback here you would need to give education first feedback without some one who can handle it is not usefull. 

## Bundled Extensions

includes a set of built-in extensions located in the /extensions folder, including grammars and snippets for many languages. Extensions that provide rich language support (code completion, Go to Definition) for a language have the suffix `language-features`. For example, the `json` extension provides coloring for `JSON` and the `json-language-features` extension provides rich language support for `JSON`.

## Related stuff
copyed from: https://raw.githubusercontent.com/lemanschik/code-wiki/main/Related-Projects.md

## Core Repositories
|Component|Repository|
|---|---|
|Standalone Monaco Editor|[monaco-editor](https://github.com/Microsoft/monaco-editor)|
|Node Debug (for node < v8.0)|[vscode-node-debug](https://github.com/microsoft/vscode-node-debug)|
|Node Debug (for node >= v6.3)|[vscode-node-debug2](https://github.com/microsoft/vscode-node-debug2)|
|Node Debug Adapter |[vscode-debugadapter-node](https://github.com/Microsoft/vscode-debugadapter-node)|
|Chrome Debug Core| [vscode-chrome-debug-core](https://github.com/Microsoft/vscode-chrome-debug-core)|
|File Watcher|[vscode-filewatcher-windows](https://github.com/microsoft/vscode-filewatcher-windows)|
|`vscode.d.ts`|[vscode-extension-code](https://github.com/microsoft/vscode-extension-vscode)|
|`vscode-languageserver`|[vscode-languageserver-node](https://github.com/microsoft/vscode-languageserver-node)|
|TextMate tokenizer|[vscode-textmate](https://github.com/microsoft/vscode-textmate)|
|AMD Loader|[vscode-loader](https://github.com/microsoft/vscode-loader)|
|Windows Process Tree|[vscode-windows-process-tree](https://github.com/microsoft/vscode-windows-process-tree)|
|References View|[vscode-references-view](https://github.com/microsoft/vscode-references-view)|
|Octicons Font|[vscode-octicons-font](https://github.com/microsoft/vscode-octicons-font)|
|Terminal frontend|[xterm.js](https://github.com/xtermjs/xterm.js)
|Terminal backend|[node-pty](https://github.com/microsoft/node-pty)

## SDK Tools
|Tool|Repository|
|---|---|
|yo code generator|[vscode-generator-code](https://github.com/microsoft/vscode-generator-code)|
|vsce publishing tool|[vscode-vsce](https://github.com/microsoft/vscode-vsce)|
|Telemetry for extensions|[vscode-extension-telemetry](https://github.com/Microsoft/vscode-extension-telemetry)|
|NLS Tools|[NLS Tools](https://github.com/Microsoft/vscode-nls)

## Documentation
|Repository|
|---|
|[vscode-docs](https://github.com/microsoft/vscode-docs)|
 
## Languages
|Language|Repository|
|---|---|
|Language server protocol|[Language Server Protocol](https://github.com/Microsoft/language-server-protocol)
|CSS/LESS/SCSS Language Service|[vscode-css-languageservice](https://github.com/microsoft/vscode-css-languageservice)|
|JSON Language Service|[vscode-json-languageservice](https://github.com/microsoft/vscode-json-languageservice)|
|HTML Language Service|[vscode-html-languageservice](https://github.com/microsoft/vscode-html-languageservice)|
|Go|[vscode-go](https://github.com/microsoft/vscode-go)|
|Emmet Helper|[vscode-emmet-helper](https://github.com/Microsoft/vscode-emmet-helper)|
|Markdown Textmate Grammar|[vscode-markdown-tm-grammar](https://github.com/Microsoft/vscode-markdown-tm-grammar)|

## Localization
|Tool|Repository|
|---|---|
|NLS Tools|[NLS Tools](https://github.com/Microsoft/vscode-nls-dev)

## Source Code Control
|Provider|Repository|
|---|---|
|Github|[Github Pull Requests](https://github.com/Microsoft/vscode-pull-request-github)

## Linters
|Linter|Repository|
|---|---|
|TSLint	|[vscode-tslint](https://github.com/microsoft/vscode-tslint)|
|TSLint TypeScript Plugin	|[vscode-typescript-tslint-plugin](https://github.com/Microsoft/vscode-typescript-tslint-plugin)|
|ESLint	|[vscode-eslint](https://github.com/microsoft/vscode-eslint)|
|jshint |[vscode-jshint](https://github.com/Microsoft/vscode-jshint)|

## Debuggers
|Debugger|Repository|
|---|---|
|Chrome Debugger |[vscode-chrome-debug](https://github.com/Microsoft/vscode-chrome-debug)|

## NPM
|Repository|
|---|
|[vscode-npm-scripts](https://github.com/Microsoft/vscode-npm-scripts)

## Keybindings
|Tool|Repository|
|---|---|
|Sublime |[vscode-sublime-keybindings](https://github.com/Microsoft/vscode-sublime-keybindings)|
|Atom |[vscode-atom-keybindings](https://github.com/Microsoft/vscode-atom-keybindings)|
|Visual Studio |[vscode-vs-keybindings](https://github.com/Microsoft/vscode-vs-keybindings)|

## Themes
|Theme|
|---|
|[vscode-themes](https://github.com/microsoft/vscode-themes)

## Samples
|Sample|Repository|
|---|---|
|Mock Debug Adapter|[vscode-mock-debug](https://github.com/microsoft/vscode-mock-debug)|
|Samples|[vscode-extension-samples](https://github.com/microsoft/vscode-extension-samples)|
|Debugging Recipes|[vscode-recipes](https://github.com/Microsoft/vscode-recipes)|

