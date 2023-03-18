export abstract class BulkPacket {
	protected data: DataView;

	protected abstract getExpectedCode(): number;
	abstract getEventName(): string;
	abstract getSerialisedData(): any;

	constructor(data: DataView, length: number, code: number) {
		this.data = data;

		if (code != this.getExpectedCode()) {
			throw new Error(
				`BulkPacket child instanciated for wrong packet. Got ${code}, expected ${this.getExpectedCode()}`
			);
		}

		// The given code matches what is expected for this (child) class.
		// Child constructor now has access to 'this' and can finish constructing.
	}
}
