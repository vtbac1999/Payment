import { Controller, Post, Get, Body, Param, HttpException, HttpStatus, Res } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { Response } from 'express';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  // Tạo đơn hàng thanh toán
  @Post('create')
  async createPaymentOrder(@Body() createOrderDto: CreatePaymentDto, @Res() res: Response) {
    const data = await this.paymentService.createPaymentOrder(createOrderDto);
    if(data.code != '00'){
      throw new HttpException(
        data.desc,
        data.code
      );
    }
    res.redirect(200, data.data.checkoutUrl);
  }

  // Kiểm tra trạng thái thanh toán
  @Get('status/:orderId')
  async checkPaymentStatus(@Param('orderId') orderId: string) {
    return this.paymentService.checkPaymentStatus(orderId);
  }

  @Post('confirm-webhook')
  async handleWebhook(@Body() webhookPayload: any) {
    const { data, signature } = webhookPayload;
    const isValid = await this.paymentService.validateWebhook(data, signature);
    if (!isValid) {
      throw new HttpException('Invalid webhook signature', HttpStatus.FORBIDDEN);
    }
    const prefix = this.paymentService.checkPrefixMultiple(data.description)
    const response = await this.paymentService.webhook(prefix,data,signature)
    return response
  }
}
