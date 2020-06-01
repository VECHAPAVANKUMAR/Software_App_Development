// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export class NodeDependenciesProvider implements vscode.TreeDataProvider<Dependency> {
  constructor(private workspaceRoot: string | undefined) {}

  getTreeItem(element: Dependency): vscode.TreeItem {
    return element;
  }

  getChildren(element?: Dependency): Thenable<Dependency[]> {
    if (!this.workspaceRoot) {
      vscode.window.showInformationMessage('No dependency in empty workspace');
      return Promise.resolve([]);
    }

    if (element) {
      return Promise.resolve(
        this.getDepsInPackageJson(
          path.join(this.workspaceRoot, 'node_modules', element.label, 'package.json')
        )
      );
    } else {
      const packageJsonPath = path.join(this.workspaceRoot, 'package.json');
      if (this.pathExists(packageJsonPath)) {
        return Promise.resolve(this.getDepsInPackageJson(packageJsonPath));
      } else {
        vscode.window.showInformationMessage('Workspace has no package.json');
        return Promise.resolve([]);
      }
    }
  }

  /**
   * Given the path to package.json, read all its dependencies and devDependencies.
   */
  private getDepsInPackageJson(packageJsonPath: string): Dependency[] {
    if (this.pathExists(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

      const toDep = (moduleName: string, version: string): Dependency => {
        if (this.pathExists(path.join(this.workspaceRoot === undefined ? "" : this.workspaceRoot, 'node_modules', moduleName))) {
          return new Dependency(
            moduleName,
            version,
            vscode.TreeItemCollapsibleState.Collapsed
          );
        } else {
          return new Dependency(moduleName, version, vscode.TreeItemCollapsibleState.None);
        }
      };

      const deps = packageJson.dependencies
        ? Object.keys(packageJson.dependencies).map(dep =>
            toDep(dep, packageJson.dependencies[dep])
          )
        : [];
      const devDeps = packageJson.devDependencies
        ? Object.keys(packageJson.devDependencies).map(dep =>
            toDep(dep, packageJson.devDependencies[dep])
          )
        : [];
      return deps.concat(devDeps);
    } else {
      return [];
    }
  }

  private pathExists(p: string): boolean {
    try {
      fs.accessSync(p);
    } catch (err) {
      return false;
    }
    return true;
  }
}

class Dependency extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    private version: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState
  ) {
    super(label, collapsibleState);
  }

  get tooltip(): string {
    return `${this.label}-${this.version}`;
  }

  get description(): string {
    return this.version;
  }

  iconPath = {
    light: path.join(__filename, '..', '..', 'resources', 'light', 'dependency.svg'),
    dark: path.join(__filename, '..', '..', 'resources', 'dark', 'dependency.svg')
  };
}

export class KpmTreeItem extends vscode.TreeItem {
    constructor(
        private readonly treeItem: KpmItem,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly command?: vscode.Command
    ) {
        super(treeItem.label, collapsibleState);

        const { lightPath, darkPath } = getTreeItemIcon(treeItem);

        if (treeItem.description) {
            this.description = treeItem.description;
        }

        if (lightPath && darkPath) {
            this.iconPath.light = lightPath;
            this.iconPath.dark = darkPath;
        } else {
            // no matching tag, remove the tree item icon path
            delete this.iconPath;
        }

        this.contextValue = getTreeItemContextValue(treeItem);
    }

    get tooltip(): string {
        if (!this.treeItem) {
            return "";
        }
        if (this.treeItem.tooltip) {
            return this.treeItem.tooltip;
        } else {
            return this.treeItem.label;
        }
    }

    iconPath = {
        light: "",
        dark: "",
    };

    contextValue = "treeItem";
}

function getTreeItemIcon(treeItem: KpmItem): any {
    const iconName = treeItem.icon;
    const lightPath =
        iconName && treeItem.children.length === 0
            ? path.join("G:\Github\Software_App_Development\tree-view\resources", "light", iconName)
            : null;
    const darkPath =
        iconName && treeItem.children.length === 0
            ? path.join("G:\Github\Software_App_Development\tree-view\resources", "dark", iconName)
            : null;
    return { lightPath, darkPath };
}


// function getTreeItemIcon(treeItem: KpmItem): any {
//     const iconName = treeItem.icon;
//     const lightPath =
//         iconName && treeItem.children.length === 0
//             ? path.join(vscode.window.rootpath, "light", iconName)
//             : null;
//     const darkPath =
//         iconName && treeItem.children.length === 0
//             ? path.join(resourcePath, "dark", iconName)
//             : null;
//     return { lightPath, darkPath };
// }

function getTreeItemContextValue(treeItem: KpmItem): string {
    if (treeItem.contextValue) {
        return treeItem.contextValue;
    }
    if (treeItem.children.length) {
        return "parent";
    }
    return "child";
}



export class CodemetryMenuProvider implements vscode.TreeDataProvider<KpmItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<
        KpmItem | undefined
    > = new vscode.EventEmitter<KpmItem | undefined>();

    readonly onDidChangeTreeData: vscode.Event<KpmItem | undefined> = this
        ._onDidChangeTreeData.event;

    private view!: vscode.TreeView<KpmItem>;
    private initializedTree: boolean = false;

    constructor() {
        //
    }

    // async revealTree() {
    //     if (!this.initializedTree) {
    //         await this.refresh();
    //     }

    //     const item: KpmItem = KpmProviderManager.getInstance().getCodemetryDashboardButton();
    //     try {
    //         // select the readme item
    //         this.view.reveal(item, {
    //             focus: true,
    //             select: false
    //         });
    //     } catch (err) {
    //         logIt(`Unable to select tree item: ${err.message}`);
    //     }
    // }

    bindView(kpmTreeView: vscode.TreeView<KpmItem>): void {
        this.view = kpmTreeView;
    }

    getParent(_p: KpmItem) {
        return void 0; // all playlists are in root
    }

    // refresh(): void {
    //     this._onDidChangeTreeData.fire();
    // }

    refreshParent(parent: KpmItem) {
        this._onDidChangeTreeData.fire(parent);
    }

    getTreeItem(p: KpmItem): KpmTreeItem {
        let treeItem: any = null;
        if (p.children.length) {
            let collasibleState = codemetryCollapsedStateMap[p.label];
            if (!collasibleState) {
                treeItem = createKpmTreeItem(
                    p,
                    vscode.TreeItemCollapsibleState.Collapsed
                );
            } else {
                treeItem = createKpmTreeItem(p, collasibleState);
            }
        } else {
            treeItem = createKpmTreeItem(p, vscode.TreeItemCollapsibleState.None);
            this.initializedTree = true;
        }

        return treeItem;

    }

    async getChildren(element?: KpmItem): Promise<KpmItem[]> {
        let kpmItems: KpmItem[] = [];
        if (element) {
            // return the children of this element
            kpmItems = element.children;
        } else {
            // return the parent elements
            kpmItems = await new KpmProviderManager().getOptionsTreeParents();
        }
        return kpmItems;
    }
}

/**
 * Create the playlist tree item (root or leaf)
 * @param p
 * @param cstate
 */
function createKpmTreeItem(p: KpmItem, cstate: vscode.TreeItemCollapsibleState) {
    return new KpmTreeItem(p, cstate);
}


export class KpmItem {
    id: string = "";
    label: string = "";
    description: string = "";
    value: string = "";
    tooltip: string = "";
    command: string = "";
    commandArgs: any[] = [];
    type: string = "";
    contextValue: string = "";
    callback: any = null;
    icon: any = null;
    children: KpmItem[] = [];
    eventDescription: string = "";
    initialCollapsibleState: vscode.TreeItemCollapsibleState =
        vscode.TreeItemCollapsibleState.Collapsed;
}

export class KpmProviderManager {
    private static instance: KpmProviderManager;
    constructor() {
        //
    }

    static getInstance(): KpmProviderManager {
        if (!KpmProviderManager.instance) {
            KpmProviderManager.instance = new KpmProviderManager();
        }

        return KpmProviderManager.instance;
	}
	
	async getOptionsTreeParents(): Promise<KpmItem[]> {
        const treeItems: KpmItem[] = [];

		const signupWithGoogle = `Sign up with Google`;
		const googleSignupButton: KpmItem = this.getActionButton(
			signupWithGoogle,
			"",
			"codemetry.googleLogin",
			)
		treeItems.push(googleSignupButton);
		return treeItems
	}

	getActionButton(
        label: string,
        tooltip: string,
        command: string,
        icon = null,
        eventDescription: string = ""
    ): KpmItem {
        const item: KpmItem = new KpmItem();
        item.tooltip = tooltip;
        item.label = label;
        item.id = label;
        item.command = command;
        item.contextValue = "action_button";
        item.eventDescription = eventDescription;
        return item;
    }
}
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "tree-view" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	// The code you place here will be executed every time your command is executed

	// Display a message box to the user
	vscode.window.showInformationMessage('Hello World from tree-view!');

	// vscode.window.registerTreeDataProvider(
	// 	'cm-menu-tree',
	// 	new NodeDependenciesProvider(vscode.workspace.rootPath)
	//   );
	  
	// vscode.window.createTreeView('cm-menu-tree', {
	// 	treeDataProvider: new NodeDependenciesProvider(vscode.workspace.rootPath)
	//   });

	  const codemetryMenuTreeProvider = new CodemetryMenuProvider();
	  const codemetryMenuTreeView: vscode.TreeView<KpmItem> = vscode.window.createTreeView (
		  "cm-menu-tree",
		  {
			  treeDataProvider: codemetryMenuTreeProvider,
			  showCollapseAll: false,
		  }
	  );
	  codemetryMenuTreeProvider.bindView(codemetryMenuTreeView);
	  connectCodeMetryMenuTreeView(codemetryMenuTreeView)

	  vscode.window.createTreeView('cm-menu-view', {
		treeDataProvider: new NodeDependenciesProvider(vscode.workspace.rootPath)
	  });

	  vscode.commands.registerCommand("codemetry.googleLogin", () => {
		launchLogin("google");
	})

	};
	const codemetryCollapsedStateMap : any = {};

	export const connectCodeMetryMenuTreeView = (view: vscode.TreeView<KpmItem>) => {
		return vscode.Disposable.from(
			
			view.onDidCollapseElement(async e => {
			console.log("Collapses");
				const item: KpmItem = e.element;
				codemetryCollapsedStateMap[item.label] =
					vscode.TreeItemCollapsibleState.Collapsed;
			}),
	
			view.onDidExpandElement(async e => {
				console.log("Expanded");
				const item: KpmItem = e.element;
				codemetryCollapsedStateMap[item.label] =
					vscode.TreeItemCollapsibleState.Expanded;
			}),
	
			view.onDidChangeSelection(async e => {
				console.log("Change");
				
				if (!e.selection || e.selection.length === 0) {
					return;
				}
	
				const item: KpmItem = e.selection[0];
	
				handleKpmChangeSelection(view, item);
			}),
			view.onDidChangeVisibility(e => {
				if (e.visible) {
					//
				}
			})
		);
	}

	export const handleKpmChangeSelection = (
		view: vscode.TreeView<KpmItem>,
		item: KpmItem
	) => {
		console.log("handleChange");
		
		if (item.command) {
			const args = item.commandArgs || null;
			if (args) {
				vscode.commands.executeCommand(item.command, ...args);
			} else {
				// run the command
				vscode.commands.executeCommand(item.command);
			}
	
			// send event types	
		// deselect it
		try {
			// re-select the track without focus
			view.reveal(item, {
				focus: false,
				select: false,
			});
		} catch (err) {
			console.log("Unable to deselect track: ${err.message}");
		}
	};
}
// this method is called when your extension is deactivated
export function deactivate() {}

function launchLogin(type : string) {
	vscode.window.showInformationMessage(type)
}