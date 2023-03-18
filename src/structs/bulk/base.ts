export abstract class BulkPacket {
	protected data: DataView;

	protected magic: number;
	protected length: number;
	protected code: number;

	protected abstract getExpectedCode(): number;

	constructor(data: DataView, length: number, code: number) {
		this.data = data;
		this.length = length;

		if (code != this.getExpectedCode()) {
			throw new Error(
				`BulkPacket child instanciated for wrong packet. Got ${code}, expected ${this.getExpectedCode()}`
			);
		}

		// Code is what we expected.
		// Child constructor now has access to 'this' and can finish constructing.
	}
}
