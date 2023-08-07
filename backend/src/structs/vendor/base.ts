// Class to represent a 'packet' from a vendor request.
// Packet validation is not required as only the data sent from the USB device when handling the request is recieved.
// Unlike a bulk endpoint, where interrupt data is also recieved.

export abstract class VendorRequest {
	protected data: DataView;

	protected abstract getExpectedCode(): number;

	constructor(res?: USBInTransferResult) {
		if (res) {
			if (!res.data || !res.status) {
				throw new Error("Result is missing properties.");
			}

			// Assign the DataView to an instance attribute
			this.data = res.data;

			// Parse length byte at position 0
			const embeddedLength = res.data.getUint8(0);

			// Parse code byte at position 1
			const code = res.data.getUint8(1);

			const bufferLength = res.data.buffer.byteLength;

			if (bufferLength != embeddedLength) {
				throw new Error(`Length ${bufferLength} not expected (embedded) value ${embeddedLength}.`);
			}

			// Check that the given code matches what we expect for our child (class).
			// (Unknown has an expected code of zero, so this if statement will fail in a Unknown instance.)
			if (code != this.getExpectedCode()) {
				console.warn(`Code ${code} not expected (hardcoded) value ${this.getExpectedCode()}`);

				// If the recieved code is zero (unknown struct) from the device, return a new instance of Unknown.
				if (code == 0) {
					return new Unknown(res);
				} else {
					// This should not happen, throw an error if we get here.
					throw new Error(`Unexpected non-zero code ${code}.`);
				}
			}
		}
		// If res is null, we are constructing a child class using an object of a previous instance.
		// No action is needed here, but this (super() from the child's perspective) must be executed before the 'this' keyword is available to the child.
	}
}

class Unknown extends VendorRequest {
	protected getExpectedCode(): number {
		return 0;
	}
}
