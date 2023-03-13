import { VendorRequest } from "./base";

export class BuildInfo extends VendorRequest {
	private sha: string;
	private date_str: string;
	private date: Date;

	constructor(res?: USBInTransferResult, reconstruct?: BuildInfo) {
		if (res) {
			super(res);

			// 40  (2-41) characters (slice does not include (exclusive of) end element)
			const sha_keycodes = this.intData.slice(2, 42);
			this.sha = new TextDecoder().decode(sha_keycodes);

			// 42-67 (end)
			const date_keycodes = this.intData.slice(42, 67);
			this.date_str = new TextDecoder().decode(date_keycodes);
			this.date = new Date(this.date_str);
		} else {
			// Reconstruct the class instance using an object of a previous instance
			// (Object representation of a class sent over a worker message)
			super();
			this.sha = reconstruct.sha;
			this.date_str = reconstruct.date_str;
			this.date = reconstruct.date;
		}
	}

	protected getExpectedCode(): number {
		return 2;
	}

	getSha() {
		return this.sha;
	}

	getDateStr() {
		return this.date_str;
	}

	getDate() {
		return this.date;
	}
}
