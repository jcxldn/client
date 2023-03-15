import { EventEmitter } from "events";
import { Constants } from "../constants";

export class BulkListener {
	private device: USBDevice;
	private emitter: EventEmitter;

	private magicStrLe: string;

	private unparsedData: DataView;

	constructor(device: USBDevice) {
		this.device = device;
		this.emitter = new EventEmitter();

		this.emitter.on("make_req", this.makeReq);

		// Create a string with the little endian hex representation of the magic (packet header).
		// magic is four bytes (uint32)
		const matchBuffer = Buffer.alloc(4);
		matchBuffer.writeUint32LE(Constants.BULK_PACKET_MAGIC);
		this.magicStrLe = matchBuffer.toString("hex");
	}

	private appendBuffer(b1: ArrayBuffer, b2: ArrayBuffer) {
		// Uint8Array = one byte per item
		// (uint8 is a single byte value)
		const combinedArr = new Uint8Array(b1.byteLength + b2.byteLength);
		combinedArr.set(new Uint8Array(b1), 0);
		combinedArr.set(new Uint8Array(b2), b1.byteLength);
		return combinedArr.buffer;
	}

	private combineDataViews(newData: DataView) {
		// 1. Retrieve the ArrayBuffer from the current DataView
		const currentBuffer = this.unparsedData.buffer;

		// 2. Retrieve the ArrayBuffer from the new DataView.
		const newBuffer = newData.buffer;

		// Combine the two ArrayBuffers
		const combinedBuffer = this.appendBuffer(currentBuffer, newBuffer);

		// Create a new DataView using the combined ArrayBuffer.
		const combinedDataView = new DataView(combinedBuffer);

		// Set the unparsedData variable to the new DataView.
		this.unparsedData = combinedDataView;
	}

	async makeReq() {
		// Read 128b at a time
		const res = await this.device.transferIn(3, 128);

		if (res.status == "ok") {
			// USB reports that the transfer was successful.
			// Since this is a bulk endpoint, unwanted data may be in this buffer.
			// Therefore we need to identify the start of one of our packets.
			// Since a packet may cross the 128 byte boundary, we will store the contents of this buffer, and pop items as needed.
			// Each time we get a request, we will append the response data this to the buffer, like a queue.
			//this.combineDataViews(res.data);

			// testing witthout support for 128b+
			this.unparsedData = res.data;

			// Create string representation of the hex bytes in the buffer.
			const hex = Buffer.from(res.data.buffer).toString("hex");

			/**let startOfPacket: number;
			while ((startOfPacket = hex.indexOf(matchStrLe)) != -1) {
				// Start of packet is the first byte of the packet.
				console.log("Found packet at index" + startOfPacket);

				// Parse packet

				// Next we should remove this match from the buffer (or hex str)
			}*/
			// Commented out as is currently an infinite loop

			console.log(`Found first packet header at index ${hex.indexOf(this.magicStrLe)}`);

			// Try and find a magic packet!
			debugger;
		}
	}
}
