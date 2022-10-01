import * as vscode from "vscode";
import { Logger } from "./logger";
import * as fs from "fs";
import * as path from "path";

export class SidebarTree implements vscode.TreeDataProvider<El>, vscode.TreeDragAndDropController<El> {
	dropMimeTypes = ["application/vnd.code.tree.i-knowledge.note.sidebar"];
	dragMimeTypes = ["text/uri-list"];

	constructor(context: vscode.ExtensionContext) {
		const view = vscode.window.createTreeView(
			"i-knowledge.note.sidebar",
			{ treeDataProvider: this, showCollapseAll: true, canSelectMany: true, dragAndDropController: this }
		);
		context.subscriptions.push(view);
	}

	private root: string = "D:/home/ckh/笔记";
	private _onDidChangeTreeData: vscode.EventEmitter<El | undefined | void>
		= new vscode.EventEmitter<El | undefined | void>();
	readonly onDidChangeTreeData: vscode.Event<El | undefined | void>
		= this._onDidChangeTreeData.event;

	refresh(data?: El): void {
		this._onDidChangeTreeData.fire(data);
	}

	getTreeItem(element: El): El {
		return element;
	}

	getChildren(element?: El): Thenable<El[]> {
		return this._getElement(element);
	}

	async handleDrop(
		target: El | undefined,
		sources: vscode.DataTransfer,
		token: vscode.CancellationToken
	): Promise<void> {
		const transferItem = sources.get("application/vnd.code.tree.i-knowledge.note.sidebar");
		if (!transferItem) {
			return;
		}
		let els = transferItem.value;
	}

	async handleDrag(
		source: El[],
		treeDataTransfer: vscode.DataTransfer,
		_: vscode.CancellationToken
	): Promise<void> {
		treeDataTransfer.set("application/vnd.code.tree.i-knowledge.note.sidebar", new vscode.DataTransferItem(source));
	}

	dispose(): void {
		// nothing to dispose
	}

	private _getElement(element?: El): Thenable<El[]> {
		return new Promise<El[]>(resolve => {
			let fsPath: string = element ? element.fsPath : this.root;

			if (!element) {
				return resolve([new RootEl(this.root, this.refresh.bind(this))]);
			}

			let result: El[] = [];
			fs.readdir(fsPath, (err, files) => {
				if (err) {
					Logger.info(err.message);
					resolve(result);
				} else {
					files.forEach((f: string) => {
						let file = path.join(fsPath, f);
						let stats = fs.statSync(file);
						if (stats.isFile()) {
							result.push(new FileEl(element, file, this.refresh.bind(this)));
						} else if (stats.isDirectory()) {
							result.push(new DirEl(element, file, this.refresh.bind(this)));
						}
					});
					resolve(result);
				}
			});
		});
	}
}

function fileName(p: string): string {
	return (p.replace(/\\/g, "/").split("/").pop() as string);
}

export class El extends vscode.TreeItem {
	public refreshTree: (data?: El) => void;
	public parent: El | undefined;

	constructor(
		public fsPath: string,
		options: { refreshTree: (data?: El) => void, isFile?: boolean, parent?: El | undefined }
	) {
		let collapsibleState: vscode.TreeItemCollapsibleState
			= options.isFile ? vscode.TreeItemCollapsibleState.None : vscode.TreeItemCollapsibleState.Collapsed;
		super(fileName(fsPath), collapsibleState);
		this.resourceUri = vscode.Uri.file(fsPath);
		this.refreshTree = options.refreshTree;
		this.parent = options.parent;
	}
}

class RootEl extends El {
	constructor(p: string, refreshTree: (data?: El) => void) {
		super(p, {refreshTree: refreshTree});
		this.contextValue = "rootFolder";
		this.collapsibleState = vscode.TreeItemCollapsibleState.Expanded;
	}
}

class DirEl extends El {
	constructor(parent: El, p: string, refreshTree: (data?: El) => void) {
		super(p, {refreshTree, parent});
		this.contextValue = "folder";
	}
}

class FileEl extends El {
	constructor(parent: El, p: string, refreshTree: (data?: El) => void) {
		super(p, {refreshTree, parent, isFile: true});
		this.contextValue = "file";
		this.command = {
			command: "i-knowledge.open.file",
			title: "打开文件",
			arguments: [this]
		};
	}
}
