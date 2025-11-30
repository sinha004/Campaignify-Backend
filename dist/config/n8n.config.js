"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("@nestjs/config");
exports.default = (0, config_1.registerAs)('n8n', () => ({
    apiUrl: process.env.N8N_API_URL || 'http://localhost:5678/api/v1',
    apiKey: process.env.N8N_API_KEY || '',
    webhookBaseUrl: process.env.N8N_WEBHOOK_BASE_URL || 'http://localhost:5678/webhook',
    // Node type mappings from custom types to n8n node types
    nodeTypeMappings: {
        trigger: 'n8n-nodes-base.webhook',
        sendEmail: 'n8n-nodes-base.gmail',
        wait: 'n8n-nodes-base.wait',
        condition: 'n8n-nodes-base.if',
        getSegmentData: 'n8n-nodes-base.awsS3',
        parseCSV: 'n8n-nodes-base.spreadsheetFile',
        httpRequest: 'n8n-nodes-base.httpRequest',
    },
    // Default node configurations
    defaultNodeConfigs: {
        trigger: {
            httpMethod: 'POST',
            path: '', // Will be set dynamically
            responseMode: 'lastNode',
        },
        wait: {
            unit: 'minutes',
            amount: 1,
        },
        sendEmail: {
            resource: 'message',
            operation: 'send',
        },
    },
}));
