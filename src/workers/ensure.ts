import { EventRequest } from "../communication/request";
import { EventResponse } from "../communication/response";
import { Status } from "../communication/status";
import { WorkerClient } from "./workerClient";

export const client = async (
	client: WorkerClient,
	ctx: Worker,
	ev: MessageEvent<EventRequest>,
	func: () => Promise<any>
) => {
	if (client) {
		const responseData = await func();
		// Func completed successfully
		ctx.postMessage(new EventResponse(ev.data, Status.SUCCESS, responseData));
	} else {
		ctx.postMessage(new EventResponse(ev.data, Status.ERR_NO_CLIENT_INSTANCE));
	}
};

export const noClient = async (
	client: WorkerClient,
	ctx: Worker,
	ev: MessageEvent<EventRequest>,
	func: () => Promise<any>
) => {
	if (!client) {
		const responseData = await func();
		// Func completed successfully
		ctx.postMessage(new EventResponse(ev.data, Status.SUCCESS, responseData));
	} else {
		ctx.postMessage(new EventResponse(ev.data, Status.ERR_CLIENT_INSTANCE_EXISTS));
	}
};

export const device = async (
	client: WorkerClient,
	ctx: Worker,
	ev: MessageEvent<EventRequest>,
	func: () => Promise<any>
) => {
	// Check that client is available
	if (client) {
		if (client.hasDevice()) {
			const responseData = await func();
			// Func completed successfully
			ctx.postMessage(new EventResponse(ev.data, Status.SUCCESS, responseData));
		} else {
			// Device already exists.
			ctx.postMessage(new EventResponse(ev.data, Status.ERR_DEVICE_NOT_FOUND));
		}
	} else {
		ctx.postMessage(new EventResponse(ev.data, Status.ERR_NO_CLIENT_INSTANCE));
	}
};

export const noDevice = async (
	client: WorkerClient,
	ctx: Worker,
	ev: MessageEvent<EventRequest>,
	func: () => Promise<any>
) => {
	// Check that client is available
	if (client) {
		if (!client.hasDevice()) {
			const responseData = await func();
			// Func completed successfully
			ctx.postMessage(new EventResponse(ev.data, Status.SUCCESS, responseData));
		} else {
			// Device already exists.
			ctx.postMessage(new EventResponse(ev.data, Status.ERR_DEVICE_ALREADY_EXISTS));
		}
	} else {
		ctx.postMessage(new EventResponse(ev.data, Status.ERR_NO_CLIENT_INSTANCE));
	}
};

export const deviceOpened = async (
	client: WorkerClient,
	ctx: Worker,
	ev: MessageEvent<EventRequest>,
	func: () => Promise<any>
) => {
	// Check that client is available
	if (client) {
		if (client.hasDevice()) {
			if (client.getDevice().opened) {
				const responseData = await func();
				// Func completed successfully
				ctx.postMessage(new EventResponse(ev.data, Status.SUCCESS, responseData));
			} else {
				ctx.postMessage(new EventResponse(ev.data, Status.ERR_DEVICE_NOT_OPENED));
			}
		} else {
			// Device already exists.
			ctx.postMessage(new EventResponse(ev.data, Status.ERR_DEVICE_NOT_FOUND));
		}
	} else {
		ctx.postMessage(new EventResponse(ev.data, Status.ERR_NO_CLIENT_INSTANCE));
	}
};

export const deviceNotOpened = async (
	client: WorkerClient,
	ctx: Worker,
	ev: MessageEvent<EventRequest>,
	func: () => Promise<any>
) => {
	// Check that client is available
	if (client) {
		if (client.hasDevice()) {
			if (!client.getDevice().opened) {
				const responseData = await func();
				// Func completed successfully
				ctx.postMessage(new EventResponse(ev.data, Status.SUCCESS, responseData));
			} else {
				ctx.postMessage(new EventResponse(ev.data, Status.ERR_DEVICE_ALREADY_OPENED));
			}
		} else {
			// Device already exists.
			ctx.postMessage(new EventResponse(ev.data, Status.ERR_DEVICE_NOT_FOUND));
		}
	} else {
		ctx.postMessage(new EventResponse(ev.data, Status.ERR_NO_CLIENT_INSTANCE));
	}
};
