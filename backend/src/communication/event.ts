export const enum EventType {
	NEW_CLIENT,
	HAS_DEVICE,
	RECV_DEVICE_INFO, // Recieve device info (vid, pid) from the main thread
	OPEN_DEVICE,
	FIND_INTERFACE,
	CLAIM_INTERFACE,
	CLOSE_DEVICE,
	// Device commands (vendor requests)
	GET_VERSION,
	GET_BUILD_INFO,
	GET_BOARD_INFO,
	GET_FEATURE_SET,
	GET_FLASH_BINARY_END,
	GET_DEVICE_TYPE,
	// Command to get/set if the worker is listening to bulk endpoints.
	BULK_ENDPOINT_LISTENER_STATUS,
}
