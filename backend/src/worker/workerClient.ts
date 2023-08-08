import { Constants } from "../constants";
import { BoardInfo } from "../structs/vendor/boardInfo";
import { BuildInfo } from "../structs/vendor/buildInfo";
import { FeatureSet } from "../structs/vendor/featureSet";
import { FlashBinaryEnd } from "../structs/vendor/flashBinaryEnd";
import { Version } from "../structs/vendor/version";
import { BulkListener } from "./bulkListener";

export class WorkerClient {
	private _device: USBDevice = undefined;
	private _interface: USBInterface = undefined;

	private _bulkListener: BulkListener = undefined;

	// 'Cached' items from vendor requests
	private _cachedVersion: Version;
	private _cachedBuildInfo: BuildInfo;
	private _cachedBoardInfo: BoardInfo;
	private _cachedFeatureSet: FeatureSet;
	private _cachedFlashBinaryEnd: FlashBinaryEnd;

	get hasDevice() {
		return this.device != undefined;
	}

	get deviceIsOpened() {
		if (this.hasDevice) {
			return this.device.opened;
		} else {
			// Device is undefined, so cannot be opened.
			return false;
		}
	}

	get device() {
		return this._device;
	}

	get interface() {
		return this._interface;
	}

	get bulkListener() {
		return this._bulkListener;
	}

	setDevice(device: USBDevice) {
		this._device = device;
	}

	setInterface(iface: USBInterface) {
		this._interface = iface;
	}

	setBulkListener(listener: BulkListener) {
		this._bulkListener = listener;
	}

	async close() {
		if (this._device) {
			if (this._interface) {
				await this._device.releaseInterface(this._interface.interfaceNumber);
				this._interface = undefined;
			}
			await this._device.close();
			this._device = undefined;
		} else {
			console.warn("Attempted to close non-existent device! Doing nothing...");
		}
	}

	// Assumes device is alraedy available
	findInterface() {
		if (this.deviceIsOpened) {
			// Let's find the interface!
			const interfaces = this._device.configuration.interfaces;

			// NOTE: I feel like this could be rewritten to not use filters, instead breaking out when a match is found.
			// This version is based on the pre-worker impl.
			const matches = interfaces.filter(iface => {
				// Iterate over every interface and apply a custom filter function
				// interface is a keyword so we have to settle for iface

				// Check to see if this interface has the requested endpoint.
				// Each interface object has multple endpoint objects so we must use a filter and check to see if there is more than one match.
				const matchingEndpoints = iface.alternate.endpoints.filter(
					endpoint => endpoint.endpointNumber == Constants.ENDPOINT
				);

				// Check to see if there were any matches.
				if (matchingEndpoints.length > 0) {
					// TODO: If there are multiple matches, technically worth checking to see they all have the same endpoint:
					// However: a) This should not happen, and b) They would be the same endpoint anyway.

					// We've found a matching endpoint! Let's return it.
					return iface;
				} // (else) TODO: Ensure there is a match
			});

			// `matches` is now a list of matching interfaces.
			if (matches.length == 1) {
				// Found the interface! Let's set it
				this._interface = matches[0];
				return matches[0].interfaceNumber;
			} else {
				throw new Error(`Unexpected number of matches found. Expected 1, found ${matches.length}`);
			}
		} else {
			throw new Error("Device is not opened.");
		}
	}

	async claimInterface() {
		if (this.deviceIsOpened && this._interface != undefined) {
			// Device meeds the requirements to be claimed.
			// Check if the device is already claimed
			if (!this.interface.claimed) {
				const ifaceNum = this._interface.interfaceNumber;
				return await this._device.claimInterface(ifaceNum);
			} else {
				throw new Error("Device interface is already claimed!");
			}
		} else {
			throw new Error("Device interface cannot be claimed (is it open?)");
		}
	}

	private async makeVendorRequest(value: number, len: number) {
		if (this.deviceIsOpened) {
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
		} else {
			throw new Error("Device is not opened!");
		}
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
