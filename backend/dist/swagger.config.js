"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.swaggerSpec = void 0;
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
exports.swaggerSpec = (0, swagger_jsdoc_1.default)({
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Exon API",
            version: "1.0.0",
            description: "API documentation generated automatically",
        },
        servers: [
            {
                url: `http://localhost:${process.env.port || 3802}`,
            },
        ],
    },
    apis: ["./src/routes/*"], // 👈 auto-scan routes
});
//# sourceMappingURL=swagger.config.js.map