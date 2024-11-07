import { create } from "vs/workbench/workbench.web.main";
import { URI } from "vs/base/common/uri";
(async function () {
    // create workbench
    let config = {};
    if (window.product) {
        config = window.product;
    }
    else {
        const result = await fetch("product.json");
        config = await result.json();
    }
    if (Array.isArray(config.additionalBuiltinExtensions)) {
        const tempConfig = { ...config };
        tempConfig.additionalBuiltinExtensions =
            config.additionalBuiltinExtensions.map((ext) => URI.revive(ext));
        config = tempConfig;
    }
    let workspace;
    if (config.folderUri) {
        workspace = { folderUri: URI.revive(config.folderUri) };
    }
    else if (config.workspaceUri) {
        workspace = { workspaceUri: URI.revive(config.workspaceUri) };
    }
    else {
        workspace = undefined;
    }
    if (workspace) {
        const workspaceProvider = {
            workspace,
            open: async (workspace, options) => true,
            trusted: true,
        };
        config = { ...config, workspaceProvider };
    }
    const domElement = !!config.domElementId
        && document.getElementById(config.domElementId)
        || document.body;
    create(domElement, config);
})();
