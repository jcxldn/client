import * as React from "react";

import { Client } from "backend/src/index"

import { Button } from "@mui/material";

export default class RootComponent extends React.Component {
    client: Client;

    state = {
        hasDevice: false
    }

    constructor(props: any) {
        super(props);

        this.client = new Client();
    }

    private async updateHasDeviceState(): Promise<void> {
        return this.setState({ hasDevice: await this.client.hasDevice() })
    }

    async componentDidMount(): Promise<void> {
        await this.client.workerCreateClient();
        await this.updateHasDeviceState();
    }

    private async handleConnect() {
        await this.client.requestDevice();

        if (await this.client.hasDevice()) {
            // We have a device now, let's open it!
            await this.client.workerOpenDevice();

            await this.client.workerFindInterface();

            await this.client.workerClaimInterface();
        }

        await this.updateHasDeviceState();
    }

    private async handleDisconnect() {
        if (this.client) {
            await this.client.closeDevice();
            await this.updateHasDeviceState();
        }
    }

    render() {
        return (
            <>
                {!this.state.hasDevice ? <Button variant="outlined" onClick={() => this.handleConnect()}>Connect</Button> : <Button variant="contained" onClick={() => this.handleDisconnect()}>Disconnect</Button>}
            </>
        )

    }
}