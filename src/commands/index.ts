import * as path from "path";
import * as vscode from "vscode";
import { app } from "..";
import { El } from "../sidebarTree";
import { createFile, deletePath, mkDir, rename } from "../utils/file";

export function registerCommands(context: vscode.ExtensionContext) {
	context.subscriptions.push(vscode.commands.registerCommand(
		"i-knowledge.open.file",
		(fsPath: string) => {
			vscode.commands.executeCommand("vscode.open", vscode.Uri.file(fsPath));
		}
	));

	context.subscriptions.push(vscode.commands.registerCommand(
		"i-knowledge.file.create",
		(node: El) => {
			vscode.window.showInputBox({
				placeHolder: "Enter the new file",
				validateInput: function(value: string): vscode.InputBoxValidationMessage | null {
					if (/\\|\/|\s|\t|\n|\r/.test(value)) {
						return { message: "包含非法字符, 换个名字吧。", severity: vscode.InputBoxValidationSeverity.Error };
					}
					return null;
				}
			}).then(value => {
				if (value) {
					let dir = ["folder", "rootFolder"].includes(node.contextValue || "")
						? node.fsPath : path.dirname(node.fsPath);
					if (!/\..+$/.test(value)) {
						value = value.endsWith(".") ? `${value}md` : `${value}.md`;
					}
					createFile(path.join(dir, value));
					node.refreshTree(node);
				}
			});
		}
	));
	context.subscriptions.push(vscode.commands.registerCommand(
		"i-knowledge.dir.create",
		(node: El) => {
			if (!node) {
				return vscode.window.showSaveDialog({
					defaultUri: vscode.Uri.file("d:/"),
					title: "目录名称",
					saveLabel: "新建目录"
				}).then(((rs: vscode.Uri | undefined) => {
					if (rs) {
						app.sidebar.addRoot(rs.fsPath);
					}
				}));
			}
			vscode.window.showInputBox({
				placeHolder: "Enter the new dir",
				validateInput: function(value: string): vscode.InputBoxValidationMessage | null {
					if (/\\|\/|\s|\t|\n|\r|\./.test(value)) {
						return { message: "包含非法字符, 换个名字吧。", severity: vscode.InputBoxValidationSeverity.Error };
					}
					return null;
				}
			}).then(value => {
				if (value) {
					let dir = ["folder", "rootFolder"].includes(node.contextValue || "")
						? node.fsPath : path.dirname(node.fsPath);
					mkDir(path.join(dir, value));
					node.refreshTree(node);
				}
			});
		}
	));

	context.subscriptions.push(vscode.commands.registerCommand(
		"i-knowledge.path.rename",
		(node: El) => {
			vscode.window.showInputBox({
				placeHolder: "Enter the new name",
				validateInput: function(value: string): vscode.InputBoxValidationMessage | null {
					if (node.contextValue === "folder" && /\\|\/|\s|\t|\n|\r|\./.test(value)) {
						return { message: "包含非法字符, 换个名字吧。", severity: vscode.InputBoxValidationSeverity.Error };
					} else if (node.contextValue === "file" && /\\|\/|\s|\t|\n|\r/.test(value)) {
						return { message: "包含非法字符, 换个名字吧。", severity: vscode.InputBoxValidationSeverity.Error };
					}
					return null;
				}
			}).then(value => {
				if (value) {
					if (node.contextValue === "file" && !/\..+$/.test(value)) {
						value = value.endsWith(".") ? `${value}md` : `${value}.md`;
					}
					let dir = path.dirname(node.fsPath);
					rename(node.fsPath, path.join(dir, value));
					node.refreshTree(node.parent);
				}
			});
		}
	));

	context.subscriptions.push(vscode.commands.registerCommand(
		"i-knowledge.path.delete",
		(node: El) => {
			vscode.window.showInputBox({
				title: "目录或文件将被移除, 你确定要删除吗?",
				placeHolder: "yes 表示同意，其他值表示取消本次操作"
			}).then(value => {
				if (value && value === "yes") {
					deletePath(node.fsPath);
					node.refreshTree(node.parent);
				}
			});
		}
	));

	context.subscriptions.push(vscode.commands.registerCommand(
		"i-knowledge.sidebar.refresh",
		() => {
			app.sidebar.refresh();
		}
	));
}