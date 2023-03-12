export class WorkerClient {
	private device: USBDevice = undefined;

	hasDevice() {
		return this.device != undefined;
	}

	getDevice() {
		return this.device;
	}

	setDevice(device: USBDevice) {
		this.device = device;
	}
}
