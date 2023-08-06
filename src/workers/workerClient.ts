import { Constants } from "../constants";
import { BoardInfo } from "../structs/vendor/boardInfo";
import { BuildInfo } from "../structs/vendor/buildInfo";
import { FeatureSet } from "../structs/vendor/featureSet";
import { FlashBinaryEnd } from "../structs/vendor/flashBinaryEnd";
import { Version } from "../structs/vendor/version";
import { BulkListener } from "./bulkListener";

export class WorkerClient {
	private device: USBDevice = undefined;
	private interface: USBInterface = undefined;

	private bulkListener: BulkListener = undefined;

	// 'Cached' items from vendor requests
	private _cachedVersion: Version;
	private _cachedBuildInfo: BuildInfo;
	private _cachedBoardInfo: BoardInfo;
	private _cachedFeatureSet: FeatureSet;
	private _cachedFlashBinaryEnd: FlashBinaryEnd;

	hasDevice() {
		return this.device != undefined;
	}

	hasOpenedDevice() {
		if (this.device != undefined) {
			return this.device.opened;
		} else {
			// Device is undefined, so cannot be opened.
			return false;
		}
	}

	getDevice() {
		return this.device;
	}

	getInterface() {
		return this.interface;
	}

	getBulkListener() {
		return this.bulkListener;
	}

	setDevice(device: USBDevice) {
		this.device = device;
	}

	setInterface(iface: USBInterface) {
		this.interface = iface;
	}

	setBulkListener(listener: BulkListener) {
		this.bulkListener = listener;
	}

	// Assumes device is alraedy available
	findInterface() {
		const interfaces = this.device.configuration.interfaces;

		const matches = interfaces.filter(iface => {
			const matching = iface.alternate.endpoints.filter(
				endpoint => endpoint.endpointNumber == Constants.ENDPOINT
			);
			// Check if we have a match
			if (matching.length > 0) {
				return iface;
			}
		});

		if (matches.length == 1) {
			return matches[0];
		} else {
			throw new Error(`Unexpected number of matches found. Expected 1, found ${matches.length}.`);
		}
	}

	private async makeVendorRequest(value: number, len: number) {
		return await this.device.controlTransferIn(
			{
				requestType: "vendor",
				recipient: "endpoint",
				index: 3,
				request: 3,
				value,
			},
			len
		);
	}

	//#region Vendor Request functions

	// type paramater: https://stackoverflow.com/a/26696476
	private async makeCachedVendorRequest<T>(
		type: { new (any): T },
		cacheVariable: T,
		value: number,
		len: number
	) {
		// Check to see if the value has already been requested and 'cached'
		if (!cacheVariable) {
			// Not in 'cache', request again.
			const vendorResponse = await this.makeVendorRequest(value, len);
			cacheVariable = new type(vendorResponse);
		}

		// The value is now available.
		// (If the above block errors/fails it's promise will be rejected so we will not get here)
		return cacheVariable;
	}

	get version() {
		return this.makeCachedVendorRequest(Version, this._cachedVersion, 1, 128);
	}

	get buildInfo() {
		return this.makeCachedVendorRequest(BuildInfo, this._cachedBuildInfo, 2, 128);
	}

	get boardInfo() {
		return this.makeCachedVendorRequest(BoardInfo, this._cachedBoardInfo, 3, 128);
	}

	get featureSet() {
		return this.makeCachedVendorRequest(FeatureSet, this._cachedFeatureSet, 4, 128);
	}

	get flashBinaryEnd() {
		return this.makeCachedVendorRequest(FlashBinaryEnd, this._cachedFlashBinaryEnd, 5, 128);
	}

	//#endregion
}
