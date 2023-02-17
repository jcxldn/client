import { VendorRequest } from "./base";

export class BuildInfo extends VendorRequest {
	private sha: string;
	private date_str: string;
	private date: Date;

	constructor(res: USBInTransferResult) {
		super(res);

		// 40  (2-41) characters (slice does not include (exclusive of) end element)
		const sha_keycodes = this.intData.slice(2, 42);
		this.sha = new TextDecoder().decode(sha_keycodes);

		// 42-67 (end)
		const date_keycodes = this.intData.slice(42, 67);
		this.date_str = new TextDecoder().decode(date_keycodes);
		this.date = new Date(this.date_str);
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
