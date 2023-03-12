import { VendorRequest } from "./base";

export class BoardInfo extends VendorRequest {
	private hexUniqueId: string;

	constructor(res: USBInTransferResult) {
		super(res);

		// 2-end
		const uniqueIdRaw = this.intData.slice(2);
		this.hexUniqueId = Buffer.from(uniqueIdRaw).toString("hex");
	}

	protected getExpectedCode(): number {
		return 3;
	}

	getUniqueId() {
		return this.hexUniqueId;
	}
}
