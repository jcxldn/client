import { v4 as uuidv4 } from "uuid";

import { EventType } from "./event";

export class EventRequest {
	id: string;
	type: EventType;
	data: any;

	constructor(type: EventType, data: any = undefined) {
		this.id = uuidv4();
		this.type = type;
		this.data = data;
	}

	equals(other: EventRequest): boolean {
		return this.id == other.id && this.type == other.type;
	}
}
