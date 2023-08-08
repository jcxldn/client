import { VendorRequest } from "./base";

// three bits for device type (0-7 inclusive)
enum DeviceTypes {
	DEVELOPMENT = 7,
	REV_1 = 6,
}

export class DeviceType extends VendorRequest {
	private deviceType: DeviceTypes;

	constructor(res?: USBInTransferResult, reconstruct?: DeviceType) {
		if (res) {
			super(res);
			// deviceType is a uint8 at index 2
			this.deviceType = this.data.getUint8(2);
		} else {
			// Reconstruct the class instance using an object of a previous instance
			// (Object representation of a class sent over a worker message)
			super();
			this.deviceType = reconstruct.deviceType;
		}
	}

	protected getExpectedCode(): number {
		return 6;
	}

	getDeviceType() {
		return this.deviceType;
	}
}
