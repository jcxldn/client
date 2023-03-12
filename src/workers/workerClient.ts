import { Constants } from "../constants";

export class WorkerClient {
	private device: USBDevice = undefined;
	private interface: USBInterface = undefined;

	hasDevice() {
		return this.device != undefined;
	}

	hasOpenedDevice() {
		if (this.device != undefined) {
			return this.device.opened;
		} else {
			// Device is undefined, so cannot be opened.
			return false;
		}
	}

	getDevice() {
		return this.device;
	}

	getInterface() {
		return this.interface;
	}

	setDevice(device: USBDevice) {
		this.device = device;
	}

	setInterface(iface: USBInterface) {
		this.interface = iface;
	}

	// Assumes device is alraedy available
	findInterface() {
		const interfaces = this.device.configuration.interfaces;

		const matches = interfaces.filter(iface => {
			const matching = iface.alternate.endpoints.filter(
				endpoint => endpoint.endpointNumber == Constants.ENDPOINT
			);
			// Check if we have a match
			if (matching.length > 0) {
				return iface;
			}
		});

		if (matches.length == 1) {
			return matches[0];
		} else {
			throw new Error(`Unexpected number of matches found. Expected 1, found ${matches.length}.`);
		}
	}
}
