import * as React from "react";

import { DeviceType, DeviceTypes } from "backend/src/structs/vendor/deviceType";

import { Grid, Typography } from "@mui/material";
import { BoardInfo } from "backend/src/structs/vendor/boardInfo";

type DeviceTypeSectionProps = {
    deviceType: DeviceType;
    boardInfo: BoardInfo;

}

export default class DeviceTypeSection extends React.Component<DeviceTypeSectionProps> {
    render(): React.ReactNode {
        let boardFriendlyName: string;
        let imgSrc: string;
        switch (this.props.deviceType.getDeviceType()) {
            case DeviceTypes.REV_1: {
                boardFriendlyName = "Genoswitch Measurement Platform Rev. 1";
                imgSrc = "./RP2040.jpg";
                break;
            }
            default: {
                boardFriendlyName = "Generic Development Board";
                imgSrc = "./Raspberry_Pi_Pico_top_and_bottom_composite.jpg";
                break;
            }
        }

        return (
            <Grid container spacing={2}>
                <Grid item xs={8}>
                    <Typography variant="h4">{boardFriendlyName}</Typography>
                    <Typography>Serial: {this.props.boardInfo.getUniqueId()}</Typography>
                </Grid>
                <Grid item xs={4} display={"flex"} justifyContent={"end"}>
                    <img src={imgSrc} width={"50%"} />
                </Grid>
            </Grid>
        )
    }
}