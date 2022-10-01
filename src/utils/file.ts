import * as fs from "fs";

export function createFile(f: string) {
	fs.writeFileSync(f, "", "utf8");
}

export function mkDir(dir: string) {
	fs.mkdirSync(dir, { recursive: true });
}

export function rename(old: string, newPath: string) {
	fs.renameSync(old, newPath);
}

export function deletePath(p: string) {
	fs.rmSync(p, { recursive: true, force: true });
}

