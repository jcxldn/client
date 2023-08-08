import * as React from "react";
import { graphql, useStaticQuery } from "gatsby";
import { GatsbyImage } from "gatsby-plugin-image";

import { Button, Card, CardActions, CardContent, Divider, Grid, Typography } from "@mui/material";
import { match } from "assert";

export const query = graphql`
query WebUsbUnsupportedQuery {
  allSupportedBrowsersYaml {
    nodes {
      name
      iconPath
      downloadUrl
    }
  }
  allFile(filter: {extension: {eq: "svg"}}) {
    nodes {
      relativePath
      publicURL
    }
  }
}
`;

type BrowserEntry = {
    name: string;
    iconPath: string;
    downloadUrl: string;
};


const WebUsbUnsupported = () => {
    const data: Queries.WebUsbUnsupportedQueryQuery = useStaticQuery(query);
    const entries = data.allSupportedBrowsersYaml.nodes as BrowserEntry[];

    if (!data) {
        return (<>Loading...</>)
    } else {
        return (
            <>
                <Typography variant="h4">Sorry! You appear to be running an unsupported browser.</Typography>
                <Typography variant="h6">Supported Browsers:</Typography>
                <Grid container spacing={2}>
                    {entries.map(entry => {
                        return (<SupportedBrowserCard entry={entry} data={data} />)
                    })}
                </Grid>
            </>
        )
    }
}

type SupportedBrowserCardProps = {
    entry: BrowserEntry,
    data: Queries.WebUsbUnsupportedQueryQuery;
}

const SupportedBrowserCard = ({ entry, data }: SupportedBrowserCardProps) => {
    const matchingUrl = data.allFile.nodes.find(i => i.relativePath == entry.iconPath);
    if (matchingUrl) {
        return (
            <Grid item xs={4}>
                <Card>
                    <CardContent>
                        <Typography variant="h5">{entry.name}</Typography>
                        <Divider sx={{ padding: 2 }} />
                        <br />
                        {/** GatsbyImage does not support SVGs: https://github.com/gatsbyjs/gatsby/issues/10297 */}
                        <img src={matchingUrl.publicURL} width={200} />
                    </CardContent>
                    <CardActions>
                        <Button target="_blank" href={entry.downloadUrl} size="small">Download</Button>
                    </CardActions>
                </Card>
            </Grid>
        )
    }
}

export default WebUsbUnsupported;