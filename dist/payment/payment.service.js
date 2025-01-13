"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("axios");
const crypto_1 = require("crypto");
let PaymentService = class PaymentService {
    constructor() {
        this.baseUrl = process.env.PAYOS_BASE_URL;
        this.apiKey = process.env.PAYOS_API_KEY;
        this.clientKey = process.env.PAYOS_CLIENT_KEY;
    }
    async createPaymentOrder(createOrderDto) {
        try {
            const domain = createOrderDto.type === 1
                ? process.env.DOMAIN_LSM
                : process.env.DOMAIN_AI;
            const dataToSignature = await this.createSignature({
                amount: createOrderDto.amount,
                cancelUrl: domain,
                description: createOrderDto.type === 1
                    ? "LSM"
                    : "AI",
                orderCode: createOrderDto.orderCode,
                returnUrl: domain,
            });
            const response = await axios_1.default.post(`${this.baseUrl}/v2/payment-requests`, {
                amount: createOrderDto.amount,
                cancelUrl: domain,
                description: createOrderDto.type === 1
                    ? "LSM"
                    : "AI",
                orderCode: createOrderDto.orderCode,
                returnUrl: domain,
                signature: dataToSignature,
            }, {
                headers: {
                    "x-client-id": this.clientKey,
                    "x-api-key": this.apiKey,
                },
            });
            return response.data;
        }
        catch (error) {
            throw new common_1.HttpException(error.response?.data || "Failed to create payment order", error.response?.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async checkPaymentStatus(orderId) {
        try {
            const response = await axios_1.default.get(`${this.baseUrl}/orders/${orderId}`, {
                headers: {
                    Authorization: `Bearer ${this.apiKey}`,
                },
            });
            return response.data;
        }
        catch (error) {
            throw new common_1.HttpException(error.response?.data || "Failed to fetch payment status", error.response?.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    sortObjDataByKey(object) {
        const orderedObject = Object.keys(object)
            .sort()
            .reduce((obj, key) => {
            obj[key] = object[key];
            return obj;
        }, {});
        return orderedObject;
    }
    convertObjToQueryStr(object) {
        return Object.keys(object)
            .filter((key) => object[key] !== undefined)
            .map((key) => {
            let value = object[key];
            if (value && Array.isArray(value)) {
                value = JSON.stringify(value.map((val) => this.sortObjDataByKey(val)));
            }
            if ([null, undefined, "undefined", "null"].includes(value)) {
                value = "";
            }
            return `${key}=${value}`;
        })
            .join("&");
    }
    async createSignature(data) {
        const sortedKeys = Object.keys(data).sort();
        const dataString = sortedKeys.map((key) => `${key}=${data[key]}`).join("&");
        const hmac = (0, crypto_1.createHmac)("sha256", process.env.PAYOS_API_SECRET);
        hmac.update(dataString);
        return hmac.digest("hex");
    }
    async validateWebhook(data, signature) {
        const sortedDataByKey = this.sortObjDataByKey(data);
        const dataQueryStr = this.convertObjToQueryStr(sortedDataByKey);
        const dataToSignature = (0, crypto_1.createHmac)("sha256", process.env.PAYOS_API_SECRET)
            .update(dataQueryStr)
            .digest("hex");
        return dataToSignature === signature;
    }
    checkPrefixMultiple(description) {
        if (description.startsWith('LSM')) {
            return 'LSM';
        }
        else if (description.startsWith('AI')) {
            return 'AI';
        }
        else {
            throw new common_1.HttpException('Invalid prefix', common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async webhook(type, payload, signature) {
        const url = type == "LSM"
            ? `${process.env.DOMAIN_LSM}/webhook/`
            : `${process.env.DOMAIN_AI}/webhook/`;
        const apiResponse = await axios_1.default.post(url, {
            data: payload,
            signature: signature,
        });
        return apiResponse.data;
    }
};
exports.PaymentService = PaymentService;
exports.PaymentService = PaymentService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], PaymentService);
//# sourceMappingURL=payment.service.js.map