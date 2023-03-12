import { EventType } from "./communication/event";
import { EventRequest } from "./communication/request";
import { EventResponse } from "./workers/response";

import { EventEmitter } from "events";
import { Constants } from "./constants";

//class ResponseEmitter extends EventEmitter {}
//const emitter = new ResponseEmitter();

export class Client {
	private emitter: EventEmitter;
	private worker: Worker;

	constructor() {
		this.emitter = new EventEmitter();

		this.worker = new Worker(new URL("./workers/webusb.ts", import.meta.url));
		this.worker.onmessage = this.onMessage;
	}

	private makeResponsePromise(id: string): Promise<EventResponse> {
		return new Promise((resolve, reject) => {
			this.emitter.once(`response_${id}`, (res: EventResponse) => {
				resolve(res);
			});
		});
	}

	private async workerCreateClient() {
		const req = new EventRequest(EventType.NEW_CLIENT);
		this.worker.postMessage(req);

		const res = await this.makeResponsePromise(req.id);

		if (res.code != 0) {
			throw new Error("Error creating worker client");
		} else {
			console.log("CREATED CLIENT UWU");
		}
	}

	private async workerHasDevice() {
		const req = new EventRequest(EventType.HAS_DEVICE);
		this.worker.postMessage(req);
		const res = await this.makeResponsePromise(req.id);

		if (res.code == 0 && typeof res.data == "boolean") {
			return res.data;
		}
	}

	// requestDevice is only accessible from the main thread
	// After getting a device the [worker] navigator.usb.devices[] will populate
	private async requestDevice() {
		// 1. Check to see if the worker already has a device.
		const hasDevice = await this.workerHasDevice();
		if (!hasDevice) {
			const device = await navigator.usb.requestDevice({
				filters: [{ vendorId: Constants.USB_VENDOR_ID }],
			});
			if (device != null) {
				console.log("Found device!");
				await this.workerSendDevice(device);
			}
		}
	}

	// Now we have to send the PID and VID to the worker.
	// Inspired by example @ https://github.com/odejesush/webusb-on-workers/blob/8bec09744a26c83e7931f21d506035b6e5dbe327/EXPLAINER.md
	private async workerSendDevice(device: USBDevice) {
		const req = new EventRequest(EventType.RECV_DEVICE_INFO, {
			vendorId: device.vendorId,
			productId: device.productId,
		});
		this.worker.postMessage(req);

		const res = await this.makeResponsePromise(req.id);

		if (res.code != 0) {
			throw new Error("Error sending usb device info to worker");
		} else {
			console.log("SENT DEVICE INFO TO WORKER");
		}
	}

	async setup() {
		// TODO: Instruct the worker to create a WorkerClient if one does not already exist
		// Or just do it in 'constructor'
		await this.workerCreateClient();

		await this.requestDevice();
	}

	private onMessage = (ev: MessageEvent<EventResponse>) => {
		this.emitter.emit(`response_${ev.data.req.id}`, ev.data);
	};

	async go() {
		await this.setup();
	}
}
