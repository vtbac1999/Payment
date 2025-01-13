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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentController = void 0;
const common_1 = require("@nestjs/common");
const payment_service_1 = require("./payment.service");
const create_payment_dto_1 = require("./dto/create-payment.dto");
let PaymentController = class PaymentController {
    constructor(paymentService) {
        this.paymentService = paymentService;
    }
    async createPaymentOrder(createOrderDto, res) {
        const data = await this.paymentService.createPaymentOrder(createOrderDto);
        if (data.code != '00') {
            throw new common_1.HttpException(data.desc, data.code);
        }
        res.redirect(200, data.data.checkoutUrl);
    }
    async checkPaymentStatus(orderId) {
        return this.paymentService.checkPaymentStatus(orderId);
    }
    async handleWebhook(webhookPayload) {
        const { data, signature } = webhookPayload;
        const isValid = await this.paymentService.validateWebhook(data, signature);
        if (!isValid) {
            throw new common_1.HttpException('Invalid webhook signature', common_1.HttpStatus.FORBIDDEN);
        }
        const prefix = this.paymentService.checkPrefixMultiple(data.description);
        const response = await this.paymentService.webhook(prefix, data, signature);
        return response;
    }
};
exports.PaymentController = PaymentController;
__decorate([
    (0, common_1.Post)('create'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_payment_dto_1.CreatePaymentDto, Object]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "createPaymentOrder", null);
__decorate([
    (0, common_1.Get)('status/:orderId'),
    __param(0, (0, common_1.Param)('orderId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "checkPaymentStatus", null);
__decorate([
    (0, common_1.Post)('confirm-webhook'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "handleWebhook", null);
exports.PaymentController = PaymentController = __decorate([
    (0, common_1.Controller)('payment'),
    __metadata("design:paramtypes", [payment_service_1.PaymentService])
], PaymentController);
//# sourceMappingURL=payment.controller.js.map