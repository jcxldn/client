import { EventRequest } from "./request";
import { Status } from "./status";

export class EventResponse {
	req: EventRequest;
	status: Status;
	data: any;

	constructor(req: EventRequest, status: Status, data: any = null) {
		this.req = req;
		this.status = status;
		this.data = data;
	}
}
