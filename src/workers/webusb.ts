import { EventType } from "../communication/event";
import { EventRequest } from "../communication/request";
import { EventResponse } from "./../communication/response";
import { WorkerClient } from "./workerClient";

import { Status } from "../communication/status";

let client: WorkerClient;

console.log("Worker loaded UwU.");

export const ctx: Worker = self as any;

const postErrNoClientInstance = (ev: MessageEvent<EventRequest>) => {
	ctx.postMessage(new EventResponse(ev.data, Status.ERR_NO_CLIENT_INSTANCE));
};

// can we do `addEventListener('message', (event) => { });` instead?

ctx.onmessage = async (ev: MessageEvent<EventRequest>) => {
	switch (ev.data.type) {
		case EventType.NEW_CLIENT:
			if (!client) {
				client = new WorkerClient();
				ctx.postMessage(new EventResponse(ev.data, Status.SUCCESS));
			} else {
				ctx.postMessage(new EventResponse(ev.data, Status.ERR_CLIENT_INSTANCE_EXISTS));
			}
			break; // IMPORTANT! Otherwise will continue exec following cases
		case EventType.HAS_DEVICE:
			if (client) {
				const hasDevice = client.hasDevice();
				ctx.postMessage(new EventResponse(ev.data, Status.SUCCESS, hasDevice));
			} else {
				postErrNoClientInstance(ev);
			}
			break; // IMPORTANT! Otherwise will continue exec following cases
		case EventType.RECV_DEVICE_INFO:
			debugger;
			if (client) {
				const hasDevice = client.hasDevice();
				if (!hasDevice) {
					// Attempt to find the device
					const availableDevices = await navigator.usb.getDevices();
					if (availableDevices.length == 0) {
						ctx.postMessage(new EventResponse(ev.data, Status.ERR_DEVICE_NOT_FOUND));
					} else {
						availableDevices.forEach(device => {
							if (
								device.vendorId == ev.data.data["vendorId"] &&
								device.productId == ev.data.data["productId"]
							) {
								client.setDevice(device);
								ctx.postMessage(new EventResponse(ev.data, 0));
							}
						});
					}
				} else {
					// Already have a device
					ctx.postMessage(new EventResponse(ev.data, Status.ERR_DEVICE_ALREADY_EXISTS));
				}
			} else {
				postErrNoClientInstance(ev);
			}
			break; // IMPORTANT! Otherwise will continue exec following cases
	}
};
