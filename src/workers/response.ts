import { EventRequest } from "./request";

export class EventResponse {
	req: EventRequest;
	code: number;
	data: any;

	constructor(req: EventRequest, code: number, data: any = null) {
		this.req = req;
		this.code = code;
		this.data = data;
	}
}
