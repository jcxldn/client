export const enum EventType {
	NEW_CLIENT,
	HAS_DEVICE,
	RECV_DEVICE_INFO, // Recieve device info (vid, pid) from the main thread
	OPEN_DEVICE,
}
