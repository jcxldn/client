import { VendorRequest } from "./base";

export class Version extends VendorRequest {
	private version: number;

	constructor(res?: USBInTransferResult, reconstruct?: Version) {
		if (res) {
			super(res);
			// version is a uint8 at index 2
			this.version = this.data.getUint8(2);
		} else {
			// Reconstruct the class instance using an object of a previous instance
			// (Object representation of a class sent over a worker message)
			super();
			this.version = reconstruct.version;
		}
	}

	protected getExpectedCode(): number {
		return 1;
	}

	getVersion() {
		return this.version;
	}
}
