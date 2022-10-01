import * as vscode from "vscode";
import { registerCommands } from "./commands";
import { Logger } from "./logger";
import { SidebarTree } from "./sidebarTree";

export function activate(context: vscode.ExtensionContext) {
	Logger.info("i-knowledge is start!");
	Logger.show();

	registerCommands(context);

	new SidebarTree(context);
}

export function deactivate() {}
