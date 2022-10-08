import * as vscode from "vscode";
import { Logger } from "./logger";
import * as fs from "fs";
import * as path from "path";
import { mkDir, rename } from "./utils/file";

export class SidebarTree implements vscode.TreeDataProvider<El>, vscode.TreeDragAndDropController<El> {
	dropMimeTypes = ["application/vnd.code.tree.i-knowledge.note.sidebar"];
	dragMimeTypes = ["text/uri-list"];

	constructor(private _context: vscode.ExtensionContext) {
		const view = vscode.window.createTreeView(
			"i-knowledge.note.sidebar",
			{ treeDataProvider: this, showCollapseAll: true, canSelectMany: true, dragAndDropController: this }
		);
		_context.subscriptions.push(view);
	}

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
		if (!transferItem || !target || !target.resourceUri?.fsPath) {
			return;
		}
		let els: El[] = transferItem.value;
		let targetPath: string = target.fsPath;
		if (target.contextValue === "file") {
			targetPath = path.dirname(targetPath);
		}
		for (const el of els) {
			rename(el.fsPath, path.join(targetPath, (el.label as string)));
		}
		this.refresh();
	}

	async handleDrag(
		source: El[],
		treeDataTransfer: vscode.DataTransfer,
		_: vscode.CancellationToken
	): Promise<void> {
		treeDataTransfer.set(
			"application/vnd.code.tree.i-knowledge.note.sidebar",
			new vscode.DataTransferItem(source)
		);
	}

	dispose(): void {
		// nothing to dispose
	}

	addRoot(value: string) {
		let notes = vscode.workspace.getConfiguration("iKnowledge").get<string[]>("notes");
		notes?.push(value);
		vscode.workspace.getConfiguration("iKnowledge").update("notes", notes, vscode.ConfigurationTarget.Global);
		this.refresh();
	}

	private _getElement(element?: El): Thenable<El[]> {
		return new Promise<El[]>(resolve => {

			if (!element) {
				return resolve(this._getRootEls());
			}
			
			let fsPath: string = element.fsPath;
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

	private _getRootEls(): El[] {
		let notes = vscode.workspace.getConfiguration("iKnowledge").get<string[]>("notes");
		if (!notes || notes.length === 0) { return []; }

		let result: El[] = [];
		let newNotes: string[] = [];
		for (const root of notes) {
			if (path.isAbsolute(root) && mkDir(root)) {
				let dir = path.resolve(root);
				newNotes.push(dir);
				result.push(new RootEl(dir, this.refresh.bind(this)));
			}
		}
		vscode.workspace.getConfiguration("iKnowledge").update("notes", newNotes, vscode.ConfigurationTarget.Global);

		return result;
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
			arguments: [this.fsPath]
		};
	}
}
