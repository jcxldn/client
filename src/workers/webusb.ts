import { EventType } from "../communication/event";
import { EventRequest } from "../communication/request";
import { EventResponse } from "./../communication/response";
import { WorkerClient } from "./workerClient";

import { Status } from "../communication/status";
import { Constants } from "../constants";

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
		case EventType.OPEN_DEVICE:
			if (client) {
				if (client.hasDevice()) {
					if (!client.getDevice().opened) {
						// Device is not open
						client.getDevice().open();
						ctx.postMessage(new EventResponse(ev.data, Status.SUCCESS));
					} else {
						// Device has already been opened
						ctx.postMessage(new EventResponse(ev.data, Status.ERR_DEVICE_ALREADY_OPENED));
					}
				} else {
					ctx.postMessage(new EventResponse(ev.data, Status.ERR_DEVICE_NOT_FOUND));
				}
			} else {
				postErrNoClientInstance(ev);
			}
			break; // IMPORTANT! Otherwise will continue exec following cases
		case EventType.FIND_INTERFACE:
			// Proof of Concept find interface func.
			if (client) {
				// TODO: Should check that the interface has not already been found.
				if (client.hasOpenedDevice()) {
					// Let's find the interface!
					const interfaces = client.getDevice().configuration.interfaces;

					// NOTE: I feel like this could be rewritten to not use filters, instead breaking out when a match is found. This version is based on the pre-worker impl.
					const matches = interfaces.filter(iface => {
						// Iterate over every interface and apply a custom filter function
						// interface is a keyword so we have to settle for iface

						// Check to see if this interface has the requested endpoint.
						// Each interface object has multple endpoint objects so we must use a filter and check to see if there is more than one match.
						const matchingEndpoints = iface.alternate.endpoints.filter(
							endpoint => endpoint.endpointNumber == Constants.ENDPOINT
						);

						// Check to see if there were any matches.
						if (matchingEndpoints.length > 0) {
							// TODO: If there are multiple matches, technically worth checking to see they all have the same endpoint:
							// However: a) This should not happen, and b) They would be the same endpoint anyway.

							// We've found a matching endpoint! Let's return it.
							return iface;
						} else {
							// TODO: Ensure there is a match
						}
					});

					// `matches` is now a list of matching interfaces.
					if (matches.length == 1) {
						// Found the interface! Let's set it
						client.setInterface(matches[0]);
						ctx.postMessage(new EventResponse(ev.data, Status.SUCCESS, matches[0].interfaceNumber));
						break;
					} else {
						// TODO: Unexpected number of matches
					}
				} else {
					ctx.postMessage(new EventResponse(ev.data, Status.ERR_DEVICE_NOT_OPENED));
				}
			} else {
				postErrNoClientInstance(ev);
			}
			break; // IMPORTANT! Otherwise will continue exec following cases
	}
};
