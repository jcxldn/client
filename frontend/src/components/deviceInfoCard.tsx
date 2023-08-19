import * as React from "react";

import { Client } from "backend/src";

import { BoardInfo } from "backend/src/structs/vendor/boardInfo";
import { BuildInfo } from "backend/src/structs/vendor/buildInfo";
import { DeviceType, DeviceTypes } from "backend/src/structs/vendor/deviceType";
import { FeatureSet } from "backend/src/structs/vendor/featureSet";
import { Version } from "backend/src/structs/vendor/version";

import { Card, CardContent } from "@mui/material";
import DeviceTypeSection from "./deviceTypeSection";

type DeviceInfoCardProps = {
    client: Client;
}

interface DeviceInfoCardState {
    isReady: boolean;
    boardInfo?: BoardInfo;
    buildInfo?: BuildInfo;
    deviceType?: DeviceType;
    featureSet?: FeatureSet;
    version?: Version;
}

export default class DeviceInfoCard extends React.Component<DeviceInfoCardProps, DeviceInfoCardState> {
    client: Client;

    constructor(props: DeviceInfoCardProps) {
        super(props);

        this.client = props.client;


        this.state = {
            isReady: false

        }
    }

    async componentDidMount(): Promise<void> {
        // Gather info
        this.setState({
            isReady: true,
            boardInfo: await this.client.boardInfo,
            buildInfo: await this.client.buildInfo,
            deviceType: await this.client.deviceType,
            featureSet: await this.client.featureSet,
            version: await this.client.version
        })
    }

    render(): React.ReactNode {
        if (!this.state.isReady) {
            return (<>Loading...</>)
        } else {
            return (
                <>
                    <Card>
                        <CardContent>
                            <DeviceTypeSection deviceType={this.state.deviceType!} boardInfo={this.state.boardInfo!} />
                        </CardContent>
                    </Card>
                </>
            )
        }
    }
}