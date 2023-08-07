import { VendorRequest } from "./base";

export class FlashBinaryEnd extends VendorRequest {
	private endAddress: number;

	constructor(res?: USBInTransferResult, reconstruct?: FlashBinaryEnd) {
		if (res) {
			super(res);
			// endAddress is a uint32 (starting) at index 2
			this.endAddress = this.data.getUint32(2, true);
		} else {
			// Reconstruct the class instance using an object of a previous instance
			// (Object representation of a class sent over a worker message)
			super();
			this.endAddress = reconstruct.endAddress;
		}
	}

	protected getExpectedCode(): number {
		return 5;
	}

	getEndAddress() {
		return this.endAddress;
	}

	getEndAddressHex() {
		return this.getEndAddress().toString(16);
	}
}
