import { Controller, Post, Get, Body, Param, HttpException, HttpStatus } from '@nestjs/common';
import { PaymentService } from './payment.service';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  // Tạo đơn hàng thanh toán
  @Post('create')
  async createPaymentOrder(@Body() createOrderDto: { amount: number }) {
    const { amount } = createOrderDto;
    return await this.paymentService.createPaymentOrder(amount);
  }

  // Kiểm tra trạng thái thanh toán
  @Get('status/:orderId')
  async checkPaymentStatus(@Param('orderId') orderId: string) {
    return this.paymentService.checkPaymentStatus(orderId);
  }

  @Post('confirm-webhook')
  handleWebhook(@Body() webhookPayload: any): any {
    const { data, signature } = webhookPayload;
    const isValid = this.paymentService.validateWebhook(data, signature);
    if (!isValid) {
      throw new HttpException('Invalid webhook signature', HttpStatus.FORBIDDEN);
    }
    // Xử lý logic nếu webhook hợp lệ
    return {
      message: 'Webhook received successfully',
      data,
    };
  }
}
