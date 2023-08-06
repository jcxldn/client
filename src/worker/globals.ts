import { WorkerClient } from "./workerClient";

const ctx: Worker = self as any;

let client: WorkerClient;
const setClient = (newClient: WorkerClient) => {
	client = newClient;
};

export { client, setClient, ctx };
