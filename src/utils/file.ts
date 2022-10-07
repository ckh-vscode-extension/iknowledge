import * as fs from "fs";
import * as path from "path";
import { Logger } from "../logger";

export function createFile(f: string) {
	fs.writeFileSync(f, "", "utf8");
}

export function mkDir(dir: string): boolean {
	if (fs.existsSync(dir)) { return true; }

	try {
		fs.mkdirSync(dir, { recursive: true });
		return true;
	} catch (error) {
		return false;
	}
}

export function rename(old: string, newPath: string) {
	if (!fs.existsSync(old)) {
		return Logger.info(`重命名失败: ${old} 路径不存在`);
	}

	if (fs.existsSync(newPath)) {
		return Logger.info(`重命名失败：${newPath} 路径已存在`);
	}

	if (!fs.existsSync(path.dirname(newPath))) {
		mkDir(path.dirname(newPath));
	}

	fs.renameSync(old, newPath);
}

export function deletePath(p: string) {
	if (fs.existsSync(p) && !isRootPath(p)) {
		fs.rmSync(p, { recursive: true, force: true });
	}
}

export function isRootPath(p :string): boolean {
	return /^(\/|\w+:)(\/|\\)?$/.test(p);
}
