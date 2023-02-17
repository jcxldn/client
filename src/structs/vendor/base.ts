export abstract class VendorRequest {
	protected intData: Uint8Array;

	private length: number;
	private code: number;

	protected abstract getExpectedCode(): number;

	constructor(res: USBInTransferResult) {
		if (!res.data || !res.status) {
			throw new Error("Result is missing properties.");
		}

		this.intData = new Uint8Array(res.data.buffer);

		this.length = this.intData[0];
		this.code = this.intData[1];

		if (this.intData.length != this.length) {
			throw new Error(
				`Length ${this.intData.length} not expected (embedded) value ${this.length}.`
			);
		}

		// Check that the given code matches what we expect for our child (class).
		// (Unknown has an expected code of zero, so this if statement will fail in a Unknown instance.)
		if (this.code != this.getExpectedCode()) {
			console.warn(`Code ${this.code} not expected (hardcoded) value ${this.getExpectedCode()}`);

			// If the recieved code is zero (unknown struct) from the device, return a new instance of Unknown.
			if (this.code == 0) {
				return new Unknown(res);
			} else {
				// This should not happen, throw an error if we get here.
				throw new Error(`Unexpected non-zero code ${this.code}.`);
			}
		}
	}
}

class Unknown extends VendorRequest {
	protected getExpectedCode(): number {
		return 0;
	}
}
