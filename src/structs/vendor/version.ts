import { VendorRequest } from "./base";

export class Version extends VendorRequest {
	private version: number;

	constructor(res: USBInTransferResult) {
		super(res);
		this.version = this.intData[2];
	}

	protected getExpectedCode(): number {
		return 1;
	}

	getVersion() {
		return this.version;
	}
}
