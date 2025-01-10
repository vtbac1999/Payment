import { PaymentService } from './payment.service';
export declare class PaymentController {
    private readonly paymentService;
    constructor(paymentService: PaymentService);
    createPaymentOrder(createOrderDto: {
        amount: number;
    }): Promise<any>;
    checkPaymentStatus(orderId: string): Promise<any>;
    handleWebhook(webhookPayload: any): any;
}
