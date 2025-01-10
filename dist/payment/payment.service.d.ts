export declare class PaymentService {
    private readonly baseUrl;
    private readonly apiKey;
    constructor();
    createPaymentOrder(amount: number): Promise<any>;
    checkPaymentStatus(orderId: string): Promise<any>;
    generateDescription(): Promise<string>;
    private sortObjDataByKey;
    private convertObjToQueryStr;
    createSignature(data: any): Promise<string>;
    validateWebhook(data: Record<string, any>, signature: string): Promise<boolean>;
}
