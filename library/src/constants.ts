export const Constants = {
	// pid.codes assignment (assigned 13/06/2023)
	USB_VENDOR_ID: 0x1209,
	USB_PRODUCT_ID: 0x4a62,

	// generated based on settings
	ENDPOINT: 3,

	// 'magic' bytes that identifies the start of a bulk packet.
	BULK_PACKET_MAGIC: 0xdd24433b,
	BULK_PACKET_MAGIC_BYTE_LEN: 4,
};
