import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { Response } from 'express';
export declare class PaymentController {
    private readonly paymentService;
    constructor(paymentService: PaymentService);
    createPaymentOrder(createOrderDto: CreatePaymentDto, res: Response): Promise<void>;
    checkPaymentStatus(orderId: string): Promise<any>;
    handleWebhook(webhookPayload: any): Promise<any>;
}
