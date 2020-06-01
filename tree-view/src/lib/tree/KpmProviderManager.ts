import * as vscode from 'vscode'

import KpmItem from "../models/models"

export default class KpmTreeItem extends vscode.TreeItem {
    constructor(
        private readonly treeItem: KpmItem,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly command?: vscode.Command
    ) {
        super(treeItem.label, collapsibleState);

        // const { lightPath, darkPath } = getTreeItemIcon(treeItem);

        if (treeItem.description) {
            this.description = treeItem.description;
        }

        // if (lightPath && darkPath) {
        //     this.iconPath.light = lightPath;
        //     this.iconPath.dark = darkPath;
        // } else {
        //     // no matching tag, remove the tree item icon path
        //     delete this.iconPath;
        // }

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

function getTreeItemContextValue(treeItem: KpmItem): string {
    if (treeItem.contextValue) {
        return treeItem.contextValue;
    }
    if (treeItem.children.length) {
        return "parent";
    }
    return "child";
}
