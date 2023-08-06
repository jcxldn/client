// Core worker file.

import { ctx } from "./globals";

console.log("Client Worker loaded.");

// Import the message handler
import "./messageHandler";

// Export the web worker api
export { ctx };
