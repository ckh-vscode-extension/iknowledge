import * as vscode from "vscode";
import { Logger } from "./logger";
import { SidebarTree } from "./sidebarTree";

export function activate(context: vscode.ExtensionContext) {
	Logger.info("i-knowledge is start!");
	Logger.show();

	SidebarTree.register(context, "i-konwlede.tree.sidebar");
}

export function deactivate() {}
