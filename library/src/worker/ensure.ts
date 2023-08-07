import { EventRequest } from "../communication/request";
import { EventResponse } from "../communication/response";
import { Status } from "../communication/status";
import { WorkerClient } from "./workerClient";

export const client = async (
	wClient: WorkerClient,
	ctx: Worker,
	ev: MessageEvent<EventRequest>,
	func: () => Promise<any>,
	sendSuccessMsg: boolean = true
) => {
	if (wClient) {
		const responseData = await func();
		// Func completed successfully
		if (sendSuccessMsg) ctx.postMessage(new EventResponse(ev.data, Status.SUCCESS, responseData));
	} else {
		ctx.postMessage(new EventResponse(ev.data, Status.ERR_NO_CLIENT_INSTANCE));
	}
};

export const noClient = async (
	wClient: WorkerClient,
	ctx: Worker,
	ev: MessageEvent<EventRequest>,
	func: () => Promise<any>,
	sendSuccessMsg: boolean = true
) => {
	if (!wClient) {
		const responseData = await func();
		// Func completed successfully
		if (sendSuccessMsg) ctx.postMessage(new EventResponse(ev.data, Status.SUCCESS, responseData));
	} else {
		ctx.postMessage(new EventResponse(ev.data, Status.ERR_CLIENT_INSTANCE_EXISTS));
	}
};

export const device = async (
	wClient: WorkerClient,
	ctx: Worker,
	ev: MessageEvent<EventRequest>,
	func: () => Promise<any>,
	sendSuccessMsg: boolean = true
) => {
	// Check that client is available
	await client(
		wClient,
		ctx,
		ev,
		async () => {
			if (wClient.hasDevice) {
				const responseData = await func();
				// Func completed successfully
				if (sendSuccessMsg)
					ctx.postMessage(new EventResponse(ev.data, Status.SUCCESS, responseData));
			} else {
				// Device already exists.
				ctx.postMessage(new EventResponse(ev.data, Status.ERR_DEVICE_NOT_FOUND));
			}
		},
		false
	);
};

export const noDevice = async (
	wClient: WorkerClient,
	ctx: Worker,
	ev: MessageEvent<EventRequest>,
	func: () => Promise<any>,
	sendSuccessMsg: boolean = true
) => {
	// Check that client is available
	await client(
		wClient,
		ctx,
		ev,
		async () => {
			if (!wClient.hasDevice) {
				const responseData = await func();
				// Func completed successfully
				if (sendSuccessMsg)
					ctx.postMessage(new EventResponse(ev.data, Status.SUCCESS, responseData));
			} else {
				// Device already exists.
				ctx.postMessage(new EventResponse(ev.data, Status.ERR_DEVICE_ALREADY_EXISTS));
			}
		},
		false
	);
};

export const deviceOpened = async (
	wClient: WorkerClient,
	ctx: Worker,
	ev: MessageEvent<EventRequest>,
	func: () => Promise<any>,
	sendSuccessMsg: boolean = true
) => {
	// Check that client is available
	// device inherits client, so client check not necessary here.
	await device(
		wClient,
		ctx,
		ev,
		async () => {
			if (wClient.device.opened) {
				const responseData = await func();
				// Func completed successfully
				if (sendSuccessMsg)
					ctx.postMessage(new EventResponse(ev.data, Status.SUCCESS, responseData));
			} else {
				ctx.postMessage(new EventResponse(ev.data, Status.ERR_DEVICE_NOT_OPENED));
			}
		},
		false
	);
};

export const deviceNotOpened = async (
	wClient: WorkerClient,
	ctx: Worker,
	ev: MessageEvent<EventRequest>,
	func: () => Promise<any>,
	sendSuccessMsg: boolean = true
) => {
	// Check that client is available
	// device inherits client, so client check not necessary here.
	await device(
		wClient,
		ctx,
		ev,
		async () => {
			if (!wClient.device.opened) {
				const responseData = await func();
				// Func completed successfully
				if (sendSuccessMsg)
					ctx.postMessage(new EventResponse(ev.data, Status.SUCCESS, responseData));
			} else {
				ctx.postMessage(new EventResponse(ev.data, Status.ERR_DEVICE_ALREADY_OPENED));
			}
		},
		false
	);
};

export const usbInterface = async (
	wClient: WorkerClient,
	ctx: Worker,
	ev: MessageEvent<EventRequest>,
	func: () => Promise<any>,
	sendSuccessMsg: boolean = true
) => {
	// deviceOpened -> device -> client, so client check not necessary here.
	await deviceOpened(
		wClient,
		ctx,
		ev,
		async () => {
			// Device is opened.
			if (wClient.interface != undefined) {
				const responseData = await func();
				// Func completed successfully
				if (sendSuccessMsg)
					ctx.postMessage(new EventResponse(ev.data, Status.SUCCESS, responseData));
			} else {
				ctx.postMessage(new EventResponse(ev.data, Status.ERR_DEVICE_INTERFACE_NOT_FOUND));
			}
		},
		false
	);
};

export const interfaceClaimed = async (
	wClient: WorkerClient,
	ctx: Worker,
	ev: MessageEvent<EventRequest>,
	func: () => Promise<any>,
	sendSuccessMsg: boolean = true
) => {
	// usbInterface -> deviceOpened -> device -> client, so client check not necessary here.
	await usbInterface(
		wClient,
		ctx,
		ev,
		async () => {
			// Device is opened.
			if (wClient.interface.claimed) {
				const responseData = await func();
				// Func completed successfully
				if (sendSuccessMsg)
					ctx.postMessage(new EventResponse(ev.data, Status.SUCCESS, responseData));
			} else {
				ctx.postMessage(new EventResponse(ev.data, Status.ERR_DEVICE_INTERFACE_NOT_CLAIMED));
			}
		},
		false
	);
};
