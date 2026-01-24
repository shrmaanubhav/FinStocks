"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Import Router class from Express
const express_1 = require("express");
// Import the controller function that handles this route
const index_controller_1 = require("../controllers/index.controller");
// Create a new router instance
const router = (0, express_1.Router)();
// Define routes
// Here we define a GET request on the root path "/"
// When someone visits "/", the `index` controller function will be called
/**
 * @swagger
 * /:
 *   get:
 *     summary: Root endpoint
 *     description: Default route created by exon-cli
 *     responses:
 *       200:
 *         description: Server started
 *         content:
 *           text/html:
 *             example: "<h1>Exon server started</h1>"
 */
router.route("/").get(index_controller_1.index);
// Export the router so it can be used in app.js
exports.default = router;
//# sourceMappingURL=index.route.js.map