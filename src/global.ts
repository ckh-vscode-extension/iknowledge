import { Logger } from "./logger";
import { SidebarTree } from "./sidebarTree";

class Global {
	public sidebar!: SidebarTree;

	constructor() {
		Logger.info("App is initialized!");
	}
}

export default new Global();