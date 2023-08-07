import { VendorRequest } from "./base";

export class FeatureSet extends VendorRequest {
	private bitSet: number;

	constructor(res?: USBInTransferResult, reconstruct?: FeatureSet) {
		if (res) {
			super(res);
			//  FeatureSet consists of a uint8 bitset at index 2
			this.bitSet = this.data.getUint8(2);
		} else {
			// Reconstruct the class instance using an object of a previous instance
			// (Object representation of a class sent over a worker message)
			super();
			this.bitSet = reconstruct.bitSet;
		}
	}

	protected getExpectedCode(): number {
		return 4;
	}

	private getBit(index) {
		return (this.bitSet & (1 << index)) != 0;
	}

	getHasFlashloaderSupport() {
		return this.getBit(0);
	}
}
