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

	private appendDataView(newData: DataView) {
		if (this.unparsedData != undefined) {
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
		} else {
			// Unparsed data has not yet been initialized.
			// Set it to the new data param.
			this.unparsedData = newData;
		}
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
			this.appendDataView(res.data);

			// Create string representation of the hex bytes in the buffer.
			let hex = Buffer.from(this.unparsedData.buffer).toString("hex");

			// Try and find a magic packet!

			let startOfPacket: number;
			while ((startOfPacket = hex.indexOf(this.magicStrLe)) != -1) {
				// Since we are doing valueOf on a hex STRING, the value will correspond to the position in the string.
				// We therefore must divide it by two to get the index in the buffer. (one byte, one index)
				// DISCUSS: Seems somewhat of a sketchy way to do this!
				startOfPacket = startOfPacket / 2;

				// Start of packet is the first byte of the packet.
				console.log("Found packet at index" + startOfPacket);

				// Parse packet
				// 0-3 is the header (of size 4)
				// So startofpacket+4 is the embedded len
				const packetLength = this.unparsedData.getUint8(startOfPacket + 4);
				const packetData = this.unparsedData.buffer.slice(
					startOfPacket,
					startOfPacket + packetLength
				);

				if (packetData.byteLength != packetLength) {
					throw new Error(
						`Mismatched sizes. byte len ${packetData.byteLength}, plen ${packetLength}`
					);
				}

				// Create a packet instance.

				// We could create a new DataView using an offset, but when calling .buffer we would have to be mindful of that offset.
				// -> this.unparsedData = new DataView(this.unparsedData.buffer, startOfPacket + packetLength);
				//     (In theory this should avoid a copy, should use the same memory address?)
				// For now, (unless it is revealed that old buffers are not removed by the GC) let's just make a new buffer.
				const newBuf = this.unparsedData.buffer.slice(startOfPacket + packetLength);
				// Overwrite the unparsedData value with the new buffer
				this.unparsedData = new DataView(newBuf);
				// Recalculate the hex variable from the new buffer contents.
				hex = Buffer.from(this.unparsedData.buffer).toString("hex");
			}
		}
	}
}
