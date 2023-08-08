import * as React from "react"
import RootComponent from "../components/rootComponent";
import WebUsbUnsupported from "../components/webUsbUnsupported";


export default class IndexPage extends React.Component {
  state: {
    webUsbSupported: boolean
  }

  constructor(props: any) {
    super(props);

    this.state = {
      webUsbSupported: false
    }
  }

  componentDidMount(): void {
    this.setState({ webUsbSupported: navigator.usb != undefined })
  }

  render() {
    if (this.state.webUsbSupported) {
      return (<RootComponent />)
    } else {
      return (<WebUsbUnsupported />)
    }
  }
}