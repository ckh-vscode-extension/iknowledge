import { window } from "vscode";

export class Logger {
	private constructor() {}

	private _outPut = window.createOutputChannel("i-knowledge");
	static logger: Logger = new Logger();

	static show() {
		this.logger._outPut.show();
	}

	static info(msg: string) {
		this.logger._outPut.appendLine(`[info][${this.logger.logTime}] ${msg}`);
	}

	private get logTime(): string {
		let date = new Date();
		let h = date.getHours();
		let m = date.getMinutes();
		let s = date.getMinutes();
		let ms = date.getMilliseconds();

		return `${h}:${m}:${s}.${ms}`;
	}
}