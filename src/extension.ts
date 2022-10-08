import * as vscode from "vscode";
import { app } from ".";
import { registerCommands } from "./commands";
import { Logger } from "./logger";
import { SidebarTree } from "./sidebarTree";

export function activate(context: vscode.ExtensionContext) {
	Logger.info("extension is started!");

	registerCommands(context);

	app.sidebar = new SidebarTree(context);
}

export function deactivate() {}
