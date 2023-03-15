import { VendorRequest } from "./base";

export class BoardInfo extends VendorRequest {
	private hexUniqueId: string;

	constructor(res?: USBInTransferResult, reconstruct?: BoardInfo) {
		if (res) {
			super(res);

			// unique id spans bytes 2-end
			// The unique ID is a Uint8 array of bytes of length 8, at the time of writing.
			// It contains an array of bytes corresponding to the board ID.
			// The unique ID is the last element in a Board Info response, which starts at index 2.
			// As there is no data after the unique ID, we can disregard the end index when slicing.
			// Contains an array of bytes corresponding to the board ID.

			// Construct an ArrayBuffer containing the needed bytes
			const uniqueIdBytes = this.data.buffer.slice(2);
			// Create a Buffer object from these bytes and get their hex representation as a string.
			this.hexUniqueId = Buffer.from(uniqueIdBytes).toString("hex");
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
