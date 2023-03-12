import { EventType } from "../communication/event";
import { EventRequest } from "../communication/request";
import { EventResponse } from "./response";
import { WorkerClient } from "./workerClient";

let client: WorkerClient;

console.log("Worker loaded UwU.");

export const ctx: Worker = self as any;

// can we do `addEventListener('message', (event) => { });` instead?

ctx.onmessage = async (ev: MessageEvent<EventRequest>) => {
	switch (ev.data.type) {
		case EventType.NEW_CLIENT:
			if (!client) {
				client = new WorkerClient();
				ctx.postMessage(new EventResponse(ev.data, 0));
			} else {
				ctx.postMessage(new EventResponse(ev.data, 1));
			}
			break; // IMPORTANT! Otherwise will continue exec following cases
		case EventType.HAS_DEVICE:
			if (client) {
				const hasDevice = client.hasDevice();
				ctx.postMessage(new EventResponse(ev.data, 0, hasDevice));
			}
			break; // IMPORTANT! Otherwise will continue exec following cases
		case EventType.RECV_DEVICE_INFO:
			debugger;
			if (client) {
				const hasDevice = client.hasDevice();
				if (!hasDevice) {
					// Attempt to find the device
					const availableDevices = await navigator.usb.getDevices();
					availableDevices.forEach(device => {
						if (
							device.vendorId == ev.data.data["vendorId"] &&
							device.productId == ev.data.data["productId"]
						) {
							client.setDevice(device);
							ctx.postMessage(new EventResponse(ev.data, 0));
						}
					});
					if (!client.hasDevice) {
						// Error finding device
						ctx.postMessage(new EventResponse(ev.data, 2));
					}
				} else {
					// Already have a device
					ctx.postMessage(new EventResponse(ev.data, 1));
				}
			}
			break; // IMPORTANT! Otherwise will continue exec following cases
	}
};
