import { BulkPacket } from "./base";

export class TemperaturePacket extends BulkPacket {
	private static conversionFactor = 3.3 / (1 << 12);

	private temperature: number;

	protected getExpectedCode(): number {
		return 0;
	}

	getEventName(): string {
		return "temperature";
	}

	getSerialisedData(): any {
		return this.temperature;
	}

	constructor(data: DataView, length: number, code: number) {
		super(data, length, code);

		// Get the temperature reading from the ADC
		const raw = this.data.getUint16(6, true);

		// 1. Convert the ADC reading to a voltage
		const voltage = raw * TemperaturePacket.conversionFactor;
		this.temperature = 27 - (voltage - 0.706) / 0.001721;
	}

	getTemperature() {
		return this.temperature;
	}
}
