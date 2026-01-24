"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
// Get the port number from environment variables
// Make sure you have a .env file with `PORT=3000` or similar
const port = process.env.PORT ? Number(process.env.PORT) : 4000; // Default to 4000 if PORT is not set
// Start the server and listen on the specified port
app_1.app.listen(port, () => {
    console.log(`🚀 Exon is running on http://localhost:${port}`);
    // This message confirms that the server has started successfully
});
//# sourceMappingURL=index.js.map