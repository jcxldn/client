import { VendorRequest } from "./base";

export class BoardInfo extends VendorRequest {
	private hexUniqueId: string;

	constructor(res?: USBInTransferResult, reconstruct?: BoardInfo) {
		if (res) {
			super(res);

			// 2-end
			const uniqueIdRaw = this.intData.slice(2);
			this.hexUniqueId = Buffer.from(uniqueIdRaw).toString("hex");
		} else {
			// Reconstruct the class instance using an object of a previous instance
			// (Object representation of a class sent over a worker message)
			super();
			this.hexUniqueId = reconstruct.hexUniqueId;
		}
	}

	protected getExpectedCode(): number {
		return 3;
	}

	getUniqueId() {
		return this.hexUniqueId;
	}
}
