import { EventType } from "../communication/event";
import { EventRequest } from "../communication/request";
import { EventResponse } from "./../communication/response";
import { WorkerClient } from "./workerClient";

import { Status } from "../communication/status";
import { Constants } from "../constants";
import * as ensure from "./ensure";

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
			await ensure.noClient(client, ctx, ev, async () => {
				client = new WorkerClient();
			});
			break;
		case EventType.HAS_DEVICE:
			await ensure.client(client, ctx, ev, async () => {
				return client.hasDevice();
			});
			break; // IMPORTANT! Otherwise will continue exec following cases
		case EventType.RECV_DEVICE_INFO:
			await ensure.client(client, ctx, ev, async () => {
				return await ensure.noDevice(client, ctx, ev, async () => {
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
				});
			});
			break; // IMPORTANT! Otherwise will continue exec following cases
		case EventType.OPEN_DEVICE:
			await ensure.client(client, ctx, ev, async () => {
				return await ensure.device(client, ctx, ev, async () => {
					return await ensure.deviceNotOpened(client, ctx, ev, async () => {
						// Device is not open
						client.getDevice().open();
					});
				});
			});
			break; // IMPORTANT! Otherwise will continue exec following cases
		case EventType.FIND_INTERFACE:
			// Proof of Concept find interface func.
			await ensure.client(client, ctx, ev, async () => {
				// TODO: Should check that the interface has not already been found.
				await ensure.deviceOpened(client, ctx, ev, async () => {
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
						} // (else) TODO: Ensure there is a match
					});

					// `matches` is now a list of matching interfaces.
					if (matches.length == 1) {
						// Found the interface! Let's set it
						client.setInterface(matches[0]);
						return matches[0].interfaceNumber;
						//ctx.postMessage(new EventResponse(ev.data, Status.SUCCESS, matches[0].interfaceNumber));
					} // (else) TODO: Unexpected number of matches
				});
			});
			break; // IMPORTANT! Otherwise will continue exec following cases
	}
};
