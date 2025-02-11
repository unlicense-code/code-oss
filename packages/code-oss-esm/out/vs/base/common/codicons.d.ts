import { ThemeIcon } from './themables.js';
/**
 * Only to be used by the iconRegistry.
 */
export declare function getAllCodicons(): ThemeIcon[];
/**
 * Derived icons, that could become separate icons.
 * These mappings should be moved into the mapping file in the vscode-codicons repo at some point.
 */
export declare const codiconsDerived: {
    readonly dialogError: ThemeIcon;
    readonly dialogWarning: ThemeIcon;
    readonly dialogInfo: ThemeIcon;
    readonly dialogClose: ThemeIcon;
    readonly treeItemExpanded: ThemeIcon;
    readonly treeFilterOnTypeOn: ThemeIcon;
    readonly treeFilterOnTypeOff: ThemeIcon;
    readonly treeFilterClear: ThemeIcon;
    readonly treeItemLoading: ThemeIcon;
    readonly menuSelection: ThemeIcon;
    readonly menuSubmenu: ThemeIcon;
    readonly menuBarMore: ThemeIcon;
    readonly scrollbarButtonLeft: ThemeIcon;
    readonly scrollbarButtonRight: ThemeIcon;
    readonly scrollbarButtonUp: ThemeIcon;
    readonly scrollbarButtonDown: ThemeIcon;
    readonly toolBarMore: ThemeIcon;
    readonly quickInputBack: ThemeIcon;
    readonly dropDownButton: ThemeIcon;
    readonly symbolCustomColor: ThemeIcon;
    readonly exportIcon: ThemeIcon;
    readonly workspaceUnspecified: ThemeIcon;
    readonly newLine: ThemeIcon;
    readonly thumbsDownFilled: ThemeIcon;
    readonly thumbsUpFilled: ThemeIcon;
    readonly gitFetch: ThemeIcon;
    readonly lightbulbSparkleAutofix: ThemeIcon;
    readonly debugBreakpointPending: ThemeIcon;
};
/**
 * The Codicon library is a set of default icons that are built-in in VS Code.
 *
 * In the product (outside of base) Codicons should only be used as defaults. In order to have all icons in VS Code
 * themeable, component should define new, UI component specific icons using `iconRegistry.registerIcon`.
 * In that call a Codicon can be named as default.
 */
export declare const Codicon: {
    readonly dialogError: ThemeIcon;
    readonly dialogWarning: ThemeIcon;
    readonly dialogInfo: ThemeIcon;
    readonly dialogClose: ThemeIcon;
    readonly treeItemExpanded: ThemeIcon;
    readonly treeFilterOnTypeOn: ThemeIcon;
    readonly treeFilterOnTypeOff: ThemeIcon;
    readonly treeFilterClear: ThemeIcon;
    readonly treeItemLoading: ThemeIcon;
    readonly menuSelection: ThemeIcon;
    readonly menuSubmenu: ThemeIcon;
    readonly menuBarMore: ThemeIcon;
    readonly scrollbarButtonLeft: ThemeIcon;
    readonly scrollbarButtonRight: ThemeIcon;
    readonly scrollbarButtonUp: ThemeIcon;
    readonly scrollbarButtonDown: ThemeIcon;
    readonly toolBarMore: ThemeIcon;
    readonly quickInputBack: ThemeIcon;
    readonly dropDownButton: ThemeIcon;
    readonly symbolCustomColor: ThemeIcon;
    readonly exportIcon: ThemeIcon;
    readonly workspaceUnspecified: ThemeIcon;
    readonly newLine: ThemeIcon;
    readonly thumbsDownFilled: ThemeIcon;
    readonly thumbsUpFilled: ThemeIcon;
    readonly gitFetch: ThemeIcon;
    readonly lightbulbSparkleAutofix: ThemeIcon;
    readonly debugBreakpointPending: ThemeIcon;
    readonly add: ThemeIcon;
    readonly plus: ThemeIcon;
    readonly gistNew: ThemeIcon;
    readonly repoCreate: ThemeIcon;
    readonly lightbulb: ThemeIcon;
    readonly lightBulb: ThemeIcon;
    readonly repo: ThemeIcon;
    readonly repoDelete: ThemeIcon;
    readonly gistFork: ThemeIcon;
    readonly repoForked: ThemeIcon;
    readonly gitPullRequest: ThemeIcon;
    readonly gitPullRequestAbandoned: ThemeIcon;
    readonly recordKeys: ThemeIcon;
    readonly keyboard: ThemeIcon;
    readonly tag: ThemeIcon;
    readonly gitPullRequestLabel: ThemeIcon;
    readonly tagAdd: ThemeIcon;
    readonly tagRemove: ThemeIcon;
    readonly person: ThemeIcon;
    readonly personFollow: ThemeIcon;
    readonly personOutline: ThemeIcon;
    readonly personFilled: ThemeIcon;
    readonly gitBranch: ThemeIcon;
    readonly gitBranchCreate: ThemeIcon;
    readonly gitBranchDelete: ThemeIcon;
    readonly sourceControl: ThemeIcon;
    readonly mirror: ThemeIcon;
    readonly mirrorPublic: ThemeIcon;
    readonly star: ThemeIcon;
    readonly starAdd: ThemeIcon;
    readonly starDelete: ThemeIcon;
    readonly starEmpty: ThemeIcon;
    readonly comment: ThemeIcon;
    readonly commentAdd: ThemeIcon;
    readonly alert: ThemeIcon;
    readonly warning: ThemeIcon;
    readonly search: ThemeIcon;
    readonly searchSave: ThemeIcon;
    readonly logOut: ThemeIcon;
    readonly signOut: ThemeIcon;
    readonly logIn: ThemeIcon;
    readonly signIn: ThemeIcon;
    readonly eye: ThemeIcon;
    readonly eyeUnwatch: ThemeIcon;
    readonly eyeWatch: ThemeIcon;
    readonly circleFilled: ThemeIcon;
    readonly primitiveDot: ThemeIcon;
    readonly closeDirty: ThemeIcon;
    readonly debugBreakpoint: ThemeIcon;
    readonly debugBreakpointDisabled: ThemeIcon;
    readonly debugHint: ThemeIcon;
    readonly terminalDecorationSuccess: ThemeIcon;
    readonly primitiveSquare: ThemeIcon;
    readonly edit: ThemeIcon;
    readonly pencil: ThemeIcon;
    readonly info: ThemeIcon;
    readonly issueOpened: ThemeIcon;
    readonly gistPrivate: ThemeIcon;
    readonly gitForkPrivate: ThemeIcon;
    readonly lock: ThemeIcon;
    readonly mirrorPrivate: ThemeIcon;
    readonly close: ThemeIcon;
    readonly removeClose: ThemeIcon;
    readonly x: ThemeIcon;
    readonly repoSync: ThemeIcon;
    readonly sync: ThemeIcon;
    readonly clone: ThemeIcon;
    readonly desktopDownload: ThemeIcon;
    readonly beaker: ThemeIcon;
    readonly microscope: ThemeIcon;
    readonly vm: ThemeIcon;
    readonly deviceDesktop: ThemeIcon;
    readonly file: ThemeIcon;
    readonly fileText: ThemeIcon;
    readonly more: ThemeIcon;
    readonly ellipsis: ThemeIcon;
    readonly kebabHorizontal: ThemeIcon;
    readonly mailReply: ThemeIcon;
    readonly reply: ThemeIcon;
    readonly organization: ThemeIcon;
    readonly organizationFilled: ThemeIcon;
    readonly organizationOutline: ThemeIcon;
    readonly newFile: ThemeIcon;
    readonly fileAdd: ThemeIcon;
    readonly newFolder: ThemeIcon;
    readonly fileDirectoryCreate: ThemeIcon;
    readonly trash: ThemeIcon;
    readonly trashcan: ThemeIcon;
    readonly history: ThemeIcon;
    readonly clock: ThemeIcon;
    readonly folder: ThemeIcon;
    readonly fileDirectory: ThemeIcon;
    readonly symbolFolder: ThemeIcon;
    readonly logoGithub: ThemeIcon;
    readonly markGithub: ThemeIcon;
    readonly github: ThemeIcon;
    readonly terminal: ThemeIcon;
    readonly console: ThemeIcon;
    readonly repl: ThemeIcon;
    readonly zap: ThemeIcon;
    readonly symbolEvent: ThemeIcon;
    readonly error: ThemeIcon;
    readonly stop: ThemeIcon;
    readonly variable: ThemeIcon;
    readonly symbolVariable: ThemeIcon;
    readonly array: ThemeIcon;
    readonly symbolArray: ThemeIcon;
    readonly symbolModule: ThemeIcon;
    readonly symbolPackage: ThemeIcon;
    readonly symbolNamespace: ThemeIcon;
    readonly symbolObject: ThemeIcon;
    readonly symbolMethod: ThemeIcon;
    readonly symbolFunction: ThemeIcon;
    readonly symbolConstructor: ThemeIcon;
    readonly symbolBoolean: ThemeIcon;
    readonly symbolNull: ThemeIcon;
    readonly symbolNumeric: ThemeIcon;
    readonly symbolNumber: ThemeIcon;
    readonly symbolStructure: ThemeIcon;
    readonly symbolStruct: ThemeIcon;
    readonly symbolParameter: ThemeIcon;
    readonly symbolTypeParameter: ThemeIcon;
    readonly symbolKey: ThemeIcon;
    readonly symbolText: ThemeIcon;
    readonly symbolReference: ThemeIcon;
    readonly goToFile: ThemeIcon;
    readonly symbolEnum: ThemeIcon;
    readonly symbolValue: ThemeIcon;
    readonly symbolRuler: ThemeIcon;
    readonly symbolUnit: ThemeIcon;
    readonly activateBreakpoints: ThemeIcon;
    readonly archive: ThemeIcon;
    readonly arrowBoth: ThemeIcon;
    readonly arrowDown: ThemeIcon;
    readonly arrowLeft: ThemeIcon;
    readonly arrowRight: ThemeIcon;
    readonly arrowSmallDown: ThemeIcon;
    readonly arrowSmallLeft: ThemeIcon;
    readonly arrowSmallRight: ThemeIcon;
    readonly arrowSmallUp: ThemeIcon;
    readonly arrowUp: ThemeIcon;
    readonly bell: ThemeIcon;
    readonly bold: ThemeIcon;
    readonly book: ThemeIcon;
    readonly bookmark: ThemeIcon;
    readonly debugBreakpointConditionalUnverified: ThemeIcon;
    readonly debugBreakpointConditional: ThemeIcon;
    readonly debugBreakpointConditionalDisabled: ThemeIcon;
    readonly debugBreakpointDataUnverified: ThemeIcon;
    readonly debugBreakpointData: ThemeIcon;
    readonly debugBreakpointDataDisabled: ThemeIcon;
    readonly debugBreakpointLogUnverified: ThemeIcon;
    readonly debugBreakpointLog: ThemeIcon;
    readonly debugBreakpointLogDisabled: ThemeIcon;
    readonly briefcase: ThemeIcon;
    readonly broadcast: ThemeIcon;
    readonly browser: ThemeIcon;
    readonly bug: ThemeIcon;
    readonly calendar: ThemeIcon;
    readonly caseSensitive: ThemeIcon;
    readonly check: ThemeIcon;
    readonly checklist: ThemeIcon;
    readonly chevronDown: ThemeIcon;
    readonly chevronLeft: ThemeIcon;
    readonly chevronRight: ThemeIcon;
    readonly chevronUp: ThemeIcon;
    readonly chromeClose: ThemeIcon;
    readonly chromeMaximize: ThemeIcon;
    readonly chromeMinimize: ThemeIcon;
    readonly chromeRestore: ThemeIcon;
    readonly circleOutline: ThemeIcon;
    readonly circle: ThemeIcon;
    readonly debugBreakpointUnverified: ThemeIcon;
    readonly terminalDecorationIncomplete: ThemeIcon;
    readonly circleSlash: ThemeIcon;
    readonly circuitBoard: ThemeIcon;
    readonly clearAll: ThemeIcon;
    readonly clippy: ThemeIcon;
    readonly closeAll: ThemeIcon;
    readonly cloudDownload: ThemeIcon;
    readonly cloudUpload: ThemeIcon;
    readonly code: ThemeIcon;
    readonly collapseAll: ThemeIcon;
    readonly colorMode: ThemeIcon;
    readonly commentDiscussion: ThemeIcon;
    readonly creditCard: ThemeIcon;
    readonly dash: ThemeIcon;
    readonly dashboard: ThemeIcon;
    readonly database: ThemeIcon;
    readonly debugContinue: ThemeIcon;
    readonly debugDisconnect: ThemeIcon;
    readonly debugPause: ThemeIcon;
    readonly debugRestart: ThemeIcon;
    readonly debugStart: ThemeIcon;
    readonly debugStepInto: ThemeIcon;
    readonly debugStepOut: ThemeIcon;
    readonly debugStepOver: ThemeIcon;
    readonly debugStop: ThemeIcon;
    readonly debug: ThemeIcon;
    readonly deviceCameraVideo: ThemeIcon;
    readonly deviceCamera: ThemeIcon;
    readonly deviceMobile: ThemeIcon;
    readonly diffAdded: ThemeIcon;
    readonly diffIgnored: ThemeIcon;
    readonly diffModified: ThemeIcon;
    readonly diffRemoved: ThemeIcon;
    readonly diffRenamed: ThemeIcon;
    readonly diff: ThemeIcon;
    readonly diffSidebyside: ThemeIcon;
    readonly discard: ThemeIcon;
    readonly editorLayout: ThemeIcon;
    readonly emptyWindow: ThemeIcon;
    readonly exclude: ThemeIcon;
    readonly extensions: ThemeIcon;
    readonly eyeClosed: ThemeIcon;
    readonly fileBinary: ThemeIcon;
    readonly fileCode: ThemeIcon;
    readonly fileMedia: ThemeIcon;
    readonly filePdf: ThemeIcon;
    readonly fileSubmodule: ThemeIcon;
    readonly fileSymlinkDirectory: ThemeIcon;
    readonly fileSymlinkFile: ThemeIcon;
    readonly fileZip: ThemeIcon;
    readonly files: ThemeIcon;
    readonly filter: ThemeIcon;
    readonly flame: ThemeIcon;
    readonly foldDown: ThemeIcon;
    readonly foldUp: ThemeIcon;
    readonly fold: ThemeIcon;
    readonly folderActive: ThemeIcon;
    readonly folderOpened: ThemeIcon;
    readonly gear: ThemeIcon;
    readonly gift: ThemeIcon;
    readonly gistSecret: ThemeIcon;
    readonly gist: ThemeIcon;
    readonly gitCommit: ThemeIcon;
    readonly gitCompare: ThemeIcon;
    readonly compareChanges: ThemeIcon;
    readonly gitMerge: ThemeIcon;
    readonly githubAction: ThemeIcon;
    readonly githubAlt: ThemeIcon;
    readonly globe: ThemeIcon;
    readonly grabber: ThemeIcon;
    readonly graph: ThemeIcon;
    readonly gripper: ThemeIcon;
    readonly heart: ThemeIcon;
    readonly home: ThemeIcon;
    readonly horizontalRule: ThemeIcon;
    readonly hubot: ThemeIcon;
    readonly inbox: ThemeIcon;
    readonly issueReopened: ThemeIcon;
    readonly issues: ThemeIcon;
    readonly italic: ThemeIcon;
    readonly jersey: ThemeIcon;
    readonly json: ThemeIcon;
    readonly kebabVertical: ThemeIcon;
    readonly key: ThemeIcon;
    readonly law: ThemeIcon;
    readonly lightbulbAutofix: ThemeIcon;
    readonly linkExternal: ThemeIcon;
    readonly link: ThemeIcon;
    readonly listOrdered: ThemeIcon;
    readonly listUnordered: ThemeIcon;
    readonly liveShare: ThemeIcon;
    readonly loading: ThemeIcon;
    readonly location: ThemeIcon;
    readonly mailRead: ThemeIcon;
    readonly mail: ThemeIcon;
    readonly markdown: ThemeIcon;
    readonly megaphone: ThemeIcon;
    readonly mention: ThemeIcon;
    readonly milestone: ThemeIcon;
    readonly gitPullRequestMilestone: ThemeIcon;
    readonly mortarBoard: ThemeIcon;
    readonly move: ThemeIcon;
    readonly multipleWindows: ThemeIcon;
    readonly mute: ThemeIcon;
    readonly noNewline: ThemeIcon;
    readonly note: ThemeIcon;
    readonly octoface: ThemeIcon;
    readonly openPreview: ThemeIcon;
    readonly package: ThemeIcon;
    readonly paintcan: ThemeIcon;
    readonly pin: ThemeIcon;
    readonly play: ThemeIcon;
    readonly run: ThemeIcon;
    readonly plug: ThemeIcon;
    readonly preserveCase: ThemeIcon;
    readonly preview: ThemeIcon;
    readonly project: ThemeIcon;
    readonly pulse: ThemeIcon;
    readonly question: ThemeIcon;
    readonly quote: ThemeIcon;
    readonly radioTower: ThemeIcon;
    readonly reactions: ThemeIcon;
    readonly references: ThemeIcon;
    readonly refresh: ThemeIcon;
    readonly regex: ThemeIcon;
    readonly remoteExplorer: ThemeIcon;
    readonly remote: ThemeIcon;
    readonly remove: ThemeIcon;
    readonly replaceAll: ThemeIcon;
    readonly replace: ThemeIcon;
    readonly repoClone: ThemeIcon;
    readonly repoForcePush: ThemeIcon;
    readonly repoPull: ThemeIcon;
    readonly repoPush: ThemeIcon;
    readonly report: ThemeIcon;
    readonly requestChanges: ThemeIcon;
    readonly rocket: ThemeIcon;
    readonly rootFolderOpened: ThemeIcon;
    readonly rootFolder: ThemeIcon;
    readonly rss: ThemeIcon;
    readonly ruby: ThemeIcon;
    readonly saveAll: ThemeIcon;
    readonly saveAs: ThemeIcon;
    readonly save: ThemeIcon;
    readonly screenFull: ThemeIcon;
    readonly screenNormal: ThemeIcon;
    readonly searchStop: ThemeIcon;
    readonly server: ThemeIcon;
    readonly settingsGear: ThemeIcon;
    readonly settings: ThemeIcon;
    readonly shield: ThemeIcon;
    readonly smiley: ThemeIcon;
    readonly sortPrecedence: ThemeIcon;
    readonly splitHorizontal: ThemeIcon;
    readonly splitVertical: ThemeIcon;
    readonly squirrel: ThemeIcon;
    readonly starFull: ThemeIcon;
    readonly starHalf: ThemeIcon;
    readonly symbolClass: ThemeIcon;
    readonly symbolColor: ThemeIcon;
    readonly symbolConstant: ThemeIcon;
    readonly symbolEnumMember: ThemeIcon;
    readonly symbolField: ThemeIcon;
    readonly symbolFile: ThemeIcon;
    readonly symbolInterface: ThemeIcon;
    readonly symbolKeyword: ThemeIcon;
    readonly symbolMisc: ThemeIcon;
    readonly symbolOperator: ThemeIcon;
    readonly symbolProperty: ThemeIcon;
    readonly wrench: ThemeIcon;
    readonly wrenchSubaction: ThemeIcon;
    readonly symbolSnippet: ThemeIcon;
    readonly tasklist: ThemeIcon;
    readonly telescope: ThemeIcon;
    readonly textSize: ThemeIcon;
    readonly threeBars: ThemeIcon;
    readonly thumbsdown: ThemeIcon;
    readonly thumbsup: ThemeIcon;
    readonly tools: ThemeIcon;
    readonly triangleDown: ThemeIcon;
    readonly triangleLeft: ThemeIcon;
    readonly triangleRight: ThemeIcon;
    readonly triangleUp: ThemeIcon;
    readonly twitter: ThemeIcon;
    readonly unfold: ThemeIcon;
    readonly unlock: ThemeIcon;
    readonly unmute: ThemeIcon;
    readonly unverified: ThemeIcon;
    readonly verified: ThemeIcon;
    readonly versions: ThemeIcon;
    readonly vmActive: ThemeIcon;
    readonly vmOutline: ThemeIcon;
    readonly vmRunning: ThemeIcon;
    readonly watch: ThemeIcon;
    readonly whitespace: ThemeIcon;
    readonly wholeWord: ThemeIcon;
    readonly window: ThemeIcon;
    readonly wordWrap: ThemeIcon;
    readonly zoomIn: ThemeIcon;
    readonly zoomOut: ThemeIcon;
    readonly listFilter: ThemeIcon;
    readonly listFlat: ThemeIcon;
    readonly listSelection: ThemeIcon;
    readonly selection: ThemeIcon;
    readonly listTree: ThemeIcon;
    readonly debugBreakpointFunctionUnverified: ThemeIcon;
    readonly debugBreakpointFunction: ThemeIcon;
    readonly debugBreakpointFunctionDisabled: ThemeIcon;
    readonly debugStackframeActive: ThemeIcon;
    readonly circleSmallFilled: ThemeIcon;
    readonly debugStackframeDot: ThemeIcon;
    readonly terminalDecorationMark: ThemeIcon;
    readonly debugStackframe: ThemeIcon;
    readonly debugStackframeFocused: ThemeIcon;
    readonly debugBreakpointUnsupported: ThemeIcon;
    readonly symbolString: ThemeIcon;
    readonly debugReverseContinue: ThemeIcon;
    readonly debugStepBack: ThemeIcon;
    readonly debugRestartFrame: ThemeIcon;
    readonly debugAlt: ThemeIcon;
    readonly callIncoming: ThemeIcon;
    readonly callOutgoing: ThemeIcon;
    readonly menu: ThemeIcon;
    readonly expandAll: ThemeIcon;
    readonly feedback: ThemeIcon;
    readonly gitPullRequestReviewer: ThemeIcon;
    readonly groupByRefType: ThemeIcon;
    readonly ungroupByRefType: ThemeIcon;
    readonly account: ThemeIcon;
    readonly gitPullRequestAssignee: ThemeIcon;
    readonly bellDot: ThemeIcon;
    readonly debugConsole: ThemeIcon;
    readonly library: ThemeIcon;
    readonly output: ThemeIcon;
    readonly runAll: ThemeIcon;
    readonly syncIgnored: ThemeIcon;
    readonly pinned: ThemeIcon;
    readonly githubInverted: ThemeIcon;
    readonly serverProcess: ThemeIcon;
    readonly serverEnvironment: ThemeIcon;
    readonly pass: ThemeIcon;
    readonly issueClosed: ThemeIcon;
    readonly stopCircle: ThemeIcon;
    readonly playCircle: ThemeIcon;
    readonly record: ThemeIcon;
    readonly debugAltSmall: ThemeIcon;
    readonly vmConnect: ThemeIcon;
    readonly cloud: ThemeIcon;
    readonly merge: ThemeIcon;
    readonly export: ThemeIcon;
    readonly graphLeft: ThemeIcon;
    readonly magnet: ThemeIcon;
    readonly notebook: ThemeIcon;
    readonly redo: ThemeIcon;
    readonly checkAll: ThemeIcon;
    readonly pinnedDirty: ThemeIcon;
    readonly passFilled: ThemeIcon;
    readonly circleLargeFilled: ThemeIcon;
    readonly circleLarge: ThemeIcon;
    readonly circleLargeOutline: ThemeIcon;
    readonly combine: ThemeIcon;
    readonly gather: ThemeIcon;
    readonly table: ThemeIcon;
    readonly variableGroup: ThemeIcon;
    readonly typeHierarchy: ThemeIcon;
    readonly typeHierarchySub: ThemeIcon;
    readonly typeHierarchySuper: ThemeIcon;
    readonly gitPullRequestCreate: ThemeIcon;
    readonly runAbove: ThemeIcon;
    readonly runBelow: ThemeIcon;
    readonly notebookTemplate: ThemeIcon;
    readonly debugRerun: ThemeIcon;
    readonly workspaceTrusted: ThemeIcon;
    readonly workspaceUntrusted: ThemeIcon;
    readonly workspaceUnknown: ThemeIcon;
    readonly terminalCmd: ThemeIcon;
    readonly terminalDebian: ThemeIcon;
    readonly terminalLinux: ThemeIcon;
    readonly terminalPowershell: ThemeIcon;
    readonly terminalTmux: ThemeIcon;
    readonly terminalUbuntu: ThemeIcon;
    readonly terminalBash: ThemeIcon;
    readonly arrowSwap: ThemeIcon;
    readonly copy: ThemeIcon;
    readonly personAdd: ThemeIcon;
    readonly filterFilled: ThemeIcon;
    readonly wand: ThemeIcon;
    readonly debugLineByLine: ThemeIcon;
    readonly inspect: ThemeIcon;
    readonly layers: ThemeIcon;
    readonly layersDot: ThemeIcon;
    readonly layersActive: ThemeIcon;
    readonly compass: ThemeIcon;
    readonly compassDot: ThemeIcon;
    readonly compassActive: ThemeIcon;
    readonly azure: ThemeIcon;
    readonly issueDraft: ThemeIcon;
    readonly gitPullRequestClosed: ThemeIcon;
    readonly gitPullRequestDraft: ThemeIcon;
    readonly debugAll: ThemeIcon;
    readonly debugCoverage: ThemeIcon;
    readonly runErrors: ThemeIcon;
    readonly folderLibrary: ThemeIcon;
    readonly debugContinueSmall: ThemeIcon;
    readonly beakerStop: ThemeIcon;
    readonly graphLine: ThemeIcon;
    readonly graphScatter: ThemeIcon;
    readonly pieChart: ThemeIcon;
    readonly bracket: ThemeIcon;
    readonly bracketDot: ThemeIcon;
    readonly bracketError: ThemeIcon;
    readonly lockSmall: ThemeIcon;
    readonly azureDevops: ThemeIcon;
    readonly verifiedFilled: ThemeIcon;
    readonly newline: ThemeIcon;
    readonly layout: ThemeIcon;
    readonly layoutActivitybarLeft: ThemeIcon;
    readonly layoutActivitybarRight: ThemeIcon;
    readonly layoutPanelLeft: ThemeIcon;
    readonly layoutPanelCenter: ThemeIcon;
    readonly layoutPanelJustify: ThemeIcon;
    readonly layoutPanelRight: ThemeIcon;
    readonly layoutPanel: ThemeIcon;
    readonly layoutSidebarLeft: ThemeIcon;
    readonly layoutSidebarRight: ThemeIcon;
    readonly layoutStatusbar: ThemeIcon;
    readonly layoutMenubar: ThemeIcon;
    readonly layoutCentered: ThemeIcon;
    readonly target: ThemeIcon;
    readonly indent: ThemeIcon;
    readonly recordSmall: ThemeIcon;
    readonly errorSmall: ThemeIcon;
    readonly terminalDecorationError: ThemeIcon;
    readonly arrowCircleDown: ThemeIcon;
    readonly arrowCircleLeft: ThemeIcon;
    readonly arrowCircleRight: ThemeIcon;
    readonly arrowCircleUp: ThemeIcon;
    readonly layoutSidebarRightOff: ThemeIcon;
    readonly layoutPanelOff: ThemeIcon;
    readonly layoutSidebarLeftOff: ThemeIcon;
    readonly blank: ThemeIcon;
    readonly heartFilled: ThemeIcon;
    readonly map: ThemeIcon;
    readonly mapHorizontal: ThemeIcon;
    readonly foldHorizontal: ThemeIcon;
    readonly mapFilled: ThemeIcon;
    readonly mapHorizontalFilled: ThemeIcon;
    readonly foldHorizontalFilled: ThemeIcon;
    readonly circleSmall: ThemeIcon;
    readonly bellSlash: ThemeIcon;
    readonly bellSlashDot: ThemeIcon;
    readonly commentUnresolved: ThemeIcon;
    readonly gitPullRequestGoToChanges: ThemeIcon;
    readonly gitPullRequestNewChanges: ThemeIcon;
    readonly searchFuzzy: ThemeIcon;
    readonly commentDraft: ThemeIcon;
    readonly send: ThemeIcon;
    readonly sparkle: ThemeIcon;
    readonly insert: ThemeIcon;
    readonly mic: ThemeIcon;
    readonly thumbsdownFilled: ThemeIcon;
    readonly thumbsupFilled: ThemeIcon;
    readonly coffee: ThemeIcon;
    readonly snake: ThemeIcon;
    readonly game: ThemeIcon;
    readonly vr: ThemeIcon;
    readonly chip: ThemeIcon;
    readonly piano: ThemeIcon;
    readonly music: ThemeIcon;
    readonly micFilled: ThemeIcon;
    readonly repoFetch: ThemeIcon;
    readonly copilot: ThemeIcon;
    readonly lightbulbSparkle: ThemeIcon;
    readonly robot: ThemeIcon;
    readonly sparkleFilled: ThemeIcon;
    readonly diffSingle: ThemeIcon;
    readonly diffMultiple: ThemeIcon;
    readonly surroundWith: ThemeIcon;
    readonly share: ThemeIcon;
    readonly gitStash: ThemeIcon;
    readonly gitStashApply: ThemeIcon;
    readonly gitStashPop: ThemeIcon;
    readonly vscode: ThemeIcon;
    readonly vscodeInsiders: ThemeIcon;
    readonly codeOss: ThemeIcon;
    readonly runCoverage: ThemeIcon;
    readonly runAllCoverage: ThemeIcon;
    readonly coverage: ThemeIcon;
    readonly githubProject: ThemeIcon;
    readonly mapVertical: ThemeIcon;
    readonly foldVertical: ThemeIcon;
    readonly mapVerticalFilled: ThemeIcon;
    readonly foldVerticalFilled: ThemeIcon;
    readonly goToSearch: ThemeIcon;
    readonly percentage: ThemeIcon;
    readonly sortPercentage: ThemeIcon;
    readonly attach: ThemeIcon;
    readonly goToEditingSession: ThemeIcon;
    readonly editSession: ThemeIcon;
    readonly codeReview: ThemeIcon;
};
