import { EventEmitter } from "events";
import { Constants } from "../constants";
import { BulkPacket } from "../structs/bulk/base";
import { TemperaturePacket } from "../structs/bulk/temperature";
import { EventBulkInterrupt } from "../communication/bulkInterrupt";

export class BulkListener {
	private device: USBDevice;
	private ctx: Worker;

	private magicStrLe: string;

	private unparsedData: DataView;

	private requestTimer: ReturnType<typeof setTimeout> = undefined;

	constructor(device: USBDevice, ctx: Worker) {
		this.device = device;
		this.ctx = ctx;

		// Create a string with the little endian hex representation of the magic (packet header).
		// magic is four bytes (uint32)
		const matchBuffer = Buffer.alloc(4);
		matchBuffer.writeUint32LE(Constants.BULK_PACKET_MAGIC);
		this.magicStrLe = matchBuffer.toString("hex");
	}

	createRequestJob(force?: boolean) {
		// Note that window is not available within a worker context!
		if (this.requestTimer || force) this.requestTimer = setTimeout(this.requestLoop.bind(this), 0);
	}

	isRequestLoopRunning() {
		return this.requestTimer != undefined;
	}

	startMakeRequestLoop() {
		if (!this.requestTimer) {
			this.createRequestJob(true);
		} else {
			throw new Error("Request loop already running!");
		}
	}

	stopMakeRequestLoop() {
		if (this.requestTimer) {
			clearTimeout(this.requestTimer);
			this.requestTimer = undefined;
		} else {
			throw new Error("Request loop not running!");
		}
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

	private static tryParsePacket(data: ArrayBuffer, length: number): BulkPacket {
		const dataView = new DataView(data);
		// The magic has already been validated in bulkListener
		// (it's how we identify/search for the start of a packet)

		// Note that we cannot validate the size attribute as these packets are mixed with other data.
		// The size attribute is parsed in bulkListener to avoid passing the whole buffer to the constructor.
		// However, we can verify that the buffer length is equals to the expected packet length
		// If there is an issue when slicing the packet, this will fail.

		if (data.byteLength != length) {
			throw new Error(
				`Packet (sliced) Buffer byte length ${data.byteLength} not expected packet length ${length}. Was this packet parsed correctly in BulkListener?`
			);
		}

		// Determine the packet codev

		const code = dataView.getUint8(5);
		switch (code) {
			case 0:
				return new TemperaturePacket(dataView, length, code);
			default:
				console.warn(`Unknown bulk packet code ${code}`);
				return null;
		}
	}

	async requestLoop() {
		await this.makeReq();
		this.createRequestJob();
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

				// Parse packet
				// 0-3 is the header (of size 4)
				// So startofpacket+4 is the embedded len
				const packetLength = this.unparsedData.getUint8(startOfPacket + 4);
				const packetData = this.unparsedData.buffer.slice(
					startOfPacket,
					startOfPacket + packetLength
				);

				// The magic has already been validated in bulkListener
				// (it's how we identify/search for the start of a packet)

				// Note that we cannot validate the size attribute as these packets are mixed with other data.
				// The size attribute is parsed in bulkListener to avoid passing the whole buffer to the constructor.
				// However, we can verify that the buffer length is equals to the expected packet length
				// If there is an issue when slicing the packet, this will fail.

				if (packetData.byteLength != packetLength) {
					throw new Error(
						`Packet (sliced) Buffer byte length ${packetData.byteLength} not expected packet length ${packetLength}. Was this packet parsed correctly in BulkListener?`
					);
				}

				// Packet passed validation, let's try and instianciate a BulkPacket instance
				const packet = BulkListener.tryParsePacket(packetData, packetLength);
				if (packet) {
					this.ctx.postMessage(new EventBulkInterrupt(packet));
				}

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
