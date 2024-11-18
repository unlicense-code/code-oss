/* eslint-disable local/code-no-unexternalized-strings */
// web.main.internal,js is the esm version without the AMD Loader Bridge
import { create, URI } from '../../code-oss-esm/out/vs/workbench/workbench.web.main.internal.js';
//import { URI } from '../../code-oss-esm/out/vs/base/common/uri.js';

// create workbench
const config = window.product || {
    "productConfiguration": {
        "nameShort": "VSCode Web Sample",
        "nameLong": "VSCode Web sample",
        "applicationName": "code-web-sample",
        "dataFolderName": ".vscode-web-sample",
        "version": "1.75.0",
        "extensionsGallery": {
            "serviceUrl": "https://open-vsx.org/vscode/gallery",
            "itemUrl": "https://open-vsx.org/vscode/item",
            "resourceUrlTemplate":
                "https://openvsxorg.blob.core.windows.net/resources/{publisher}/{name}/{version}/{path}"
        },
        "extensionEnabledApiProposals": {
            "vscode.vscode-web-playground": [
                "fileSearchProvider",
                "textSearchProvider"
            ]
        }
    },
    "folderUri": { "scheme": "memfs", "path": "/sample-folder" },
    "additionalBuiltinExtensions": [
        { "scheme": "http", "path": "/myExt" }
    ]
} //await fetch('product.json');
//config = await config.json();

if (Array.isArray(config.additionalBuiltinExtensions)) {
    Object.assign(config, {
        additionalBuiltinExtensions: config.additionalBuiltinExtensions.map((ext) => URI.revive(ext))
    });
}

if (config.folderUri || config.workspaceUri) {
    Object.assign(config, {
        workspaceProvider: {
            workspace: { [config.folderUri ? "folderUri" : "workspaceUri"]: URI.revive(config.folderUri || config.workspaceUri) },
            open: async (workspace, options) => true,
            trusted: true,
        }
    });
}

create(document.body, config);

