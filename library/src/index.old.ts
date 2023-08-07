// Proof of concept.
import { Constants } from "./constants";

import { Version } from "./structs/vendor/version";
import { BuildInfo } from "./structs/vendor/buildInfo";
import { BoardInfo } from "./structs/vendor/boardInfo";
import { EventType } from "./communication/event";

export class Client {
	private device: USBDevice = undefined!;

	static isWebUsbSupported() {
		return navigator.usb != undefined;
	}

	async requestDevice() {
		if (this.device != undefined) {
			throw new Error("Device already loaded!");
		}
		this.device = await navigator.usb.requestDevice({
			filters: [{ vendorId: Constants.USB_VENDOR_ID }],
		});

		// will throw an err if cancelled
	}

	private findInterface() {
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

	private async makeVendorRequest(value: number, len: number) {
		return await this.device.controlTransferIn(
			{
				requestType: "vendor",
				recipient: "endpoint",
				index: 3,
				request: 3,
				value,
			},
			len
		);
	}

	async setup() {
		// 1. Open the device
		await this.device.open();

		// 2. Claim interface
		const iface = this.findInterface();
		this.device.claimInterface(iface.interfaceNumber);
		const worker = new Worker(new URL("./workers/webusb.ts", import.meta.url));
		worker.postMessage(EventType.NEW_CLIENT);
	}

	async getVersion() {
		// TODO: Error (Unknown()/Error) handling, just a PoC for now.
		const request = await this.makeVendorRequest(1, 128);
		const struct = new Version(request);
		return struct;
	}

	async getBuildInfo() {
		// TODO: Error (Unknown()/Error) handling, just a PoC for now.
		const request = await this.makeVendorRequest(2, 128);
		const struct = new BuildInfo(request);
		return struct;
	}

	async getBoardInfo() {
		// TODO: Error (Unknown()/Error) handling, just a PoC for now.
		const request = await this.makeVendorRequest(3, 128);
		const struct = new BoardInfo(request);
		return struct;
	}
}
