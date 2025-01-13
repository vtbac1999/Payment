import { CreatePaymentDto } from "./dto/create-payment.dto";
export declare class PaymentService {
    private readonly baseUrl;
    private readonly apiKey;
    private readonly clientKey;
    constructor();
    createPaymentOrder(createOrderDto: CreatePaymentDto): Promise<any>;
    checkPaymentStatus(orderId: string): Promise<any>;
    private sortObjDataByKey;
    private convertObjToQueryStr;
    createSignature(data: any): Promise<string>;
    validateWebhook(data: Record<string, any>, signature: string): Promise<boolean>;
    checkPrefixMultiple(description: any): "LSM" | "AI";
    webhook(type: string, payload: any, signature: string): Promise<any>;
}
