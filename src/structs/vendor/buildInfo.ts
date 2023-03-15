import { VendorRequest } from "./base";

export class BuildInfo extends VendorRequest {
	private sha: string;
	private date_str: string;
	private date: Date;

	constructor(res?: USBInTransferResult, reconstruct?: BuildInfo) {
		if (res) {
			super(res);

			// The SHA is sent as a char array of length 40.
			// The sha starts at index 2, and ends at index 41.
			// Slice does not include  (exclusive of) the end param, so we increase it by one.
			// This means that we will get a ArrayBuffer of indexes 2-41.
			const shaBytes = this.data.buffer.slice(2, 42);
			this.sha = new TextDecoder().decode(shaBytes);

			// The date is sent as a char array of length [25].
			// The date starts at index 42, and ends at 67. (end of packet.)
			// As the date object is the last item in the packet,
			// a second(end) argument for slice is not necessary.
			// slice will continue until the end of the buffer.
			const dataBytes = this.data.buffer.slice(42);
			this.date_str = new TextDecoder().decode(dataBytes);
			this.date = new Date(this.date_str);
		} else {
			// Reconstruct the class instance using an object of a previous instance
			// (Object representation of a class sent over a worker message)
			super();
			this.sha = reconstruct.sha;
			this.date_str = reconstruct.date_str;
			this.date = reconstruct.date;
		}
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
