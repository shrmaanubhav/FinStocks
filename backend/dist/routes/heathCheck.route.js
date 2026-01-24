"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const healthCheck_controller_1 = require("../controllers/healthCheck.controller");
const router = (0, express_1.Router)();
/**
 * @swagger
 * /api/v1/healthCheck:
 *   get:
 *     summary: Health check endpoint
 *     description: Returns server status
 *     responses:
 *       200:
 *         description: Server is running
 *         content:
 *           application/json:
 *             example:
 *               status: "ok"
 *
 */
router.get("/healthCheck", healthCheck_controller_1.healthCheck);
exports.default = router;
//# sourceMappingURL=heathCheck.route.js.map