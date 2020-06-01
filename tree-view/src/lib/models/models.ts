import * as vscode from 'vscode'

export default class KpmItem {
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
    icon: string = "";
    children: KpmItem[] = [];
    eventDescription: string = "";
    initialCollapsibleState: vscode.TreeItemCollapsibleState =
        vscode.TreeItemCollapsibleState.Collapsed;
}
