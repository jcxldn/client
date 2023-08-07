import { BulkPacket } from "../structs/bulk/base";
import { EventRequest } from "./request";
import { EventResponse } from "./response";
import { Status } from "./status";

export class EventBulkInterrupt implements EventResponse {
	id: string;
	data: any;
	req: EventRequest;
	status: Status;

	constructor(packet: BulkPacket) {
		this.id = packet.getEventName();
		this.data = packet.getSerialisedData();
		this.status = Status.SUCCESS;
		// Set the id/topic to be sent to the main thread
		// EventResponse expects this to be a EventRequest so we can simply cast it.
		this.req = { id: "bulk" } as EventRequest;
	}
}
