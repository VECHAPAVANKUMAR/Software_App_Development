import * as vscode from 'vscode'
import KpmItem from "../models/models"
import KpmTreeItem from "./KpmProviderManager"
const codemetryCollapsedStateMap : any = {};

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
            // kpmItems = await new KpmProviderManager().getOptionsTreeParents();
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

export const connectCodeMetryMenuTreeView = (view: vscode.TreeView<KpmItem>) => {
    return vscode.Disposable.from(
        view.onDidCollapseElement(async e => {
            const item: KpmItem = e.element;
            codemetryCollapsedStateMap[item.label] =
                vscode.TreeItemCollapsibleState.Collapsed;
        }),

        view.onDidExpandElement(async e => {
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