import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import axios from "axios";
import { createHmac } from "crypto";
import { CreatePaymentDto } from "./dto/create-payment.dto";
@Injectable()
export class PaymentService {
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly clientKey: string;

  constructor() {
    this.baseUrl = process.env.PAYOS_BASE_URL;
    this.apiKey = process.env.PAYOS_API_KEY;
    this.clientKey = process.env.PAYOS_CLIENT_KEY;
  }

  // Tạo đơn hàng
  async createPaymentOrder(createOrderDto: CreatePaymentDto) {
    try {
      const domain =
        createOrderDto.type === 1
          ? process.env.DOMAIN_LSM
          : process.env.DOMAIN_AI;
      const dataToSignature = await this.createSignature({
        amount: createOrderDto.amount,
        cancelUrl: domain,
        description:
          createOrderDto.type === 1
            ? "LSM"
            : "AI" + Number(String(new Date().getTime()).slice(-6)),
        orderCode: Number(String(new Date().getTime()).slice(-6)),
        returnUrl: domain,
      });
      const response = await axios.post(
        `${this.baseUrl}/payment-requests`,
        {
          amount: createOrderDto.amount,
          cancelUrl: domain,
          description:
            createOrderDto.type === 1
              ? "LSM"
              : "AI" + Number(String(new Date().getTime()).slice(-6)),
          orderCode: Number(String(new Date().getTime()).slice(-6)),
          returnUrl: domain,
          signature: dataToSignature,
        },
        {
          headers: {
            "x-client-id": this.clientKey,
            "x-api-key": this.apiKey,
          },
        }
      );
      return response.data;
    } catch (error) {
      throw new HttpException(
        error.response?.data || "Failed to create payment order",
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Kiểm tra trạng thái thanh toán
  async checkPaymentStatus(orderId: string) {
    try {
      const response = await axios.get(`${this.baseUrl}/orders/${orderId}`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      });
      return response.data;
    } catch (error) {
      throw new HttpException(
        error.response?.data || "Failed to fetch payment status",
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
  private sortObjDataByKey(object: Record<string, any>): Record<string, any> {
    const orderedObject = Object.keys(object)
      .sort()
      .reduce((obj, key) => {
        obj[key] = object[key];
        return obj;
      }, {});
    return orderedObject;
  }

  private convertObjToQueryStr(object: Record<string, any>): string {
    return Object.keys(object)
      .filter((key) => object[key] !== undefined)
      .map((key) => {
        let value = object[key];
        if (value && Array.isArray(value)) {
          value = JSON.stringify(
            value.map((val) => this.sortObjDataByKey(val))
          );
        }
        if ([null, undefined, "undefined", "null"].includes(value)) {
          value = "";
        }
        return `${key}=${value}`;
      })
      .join("&");
  }
  async createSignature(data: any) {
    const sortedKeys = Object.keys(data).sort();
    const dataString = sortedKeys.map((key) => `${key}=${data[key]}`).join("&");
    const hmac = createHmac("sha256", process.env.PAYOS_API_SECRET);
    hmac.update(dataString);
    return hmac.digest("hex");
  }

  async validateWebhook(
    data: Record<string, any>,
    signature: string
  ): Promise<boolean> {
    const sortedDataByKey = this.sortObjDataByKey(data); // Sắp xếp key của object
    const dataQueryStr = this.convertObjToQueryStr(sortedDataByKey); // Chuyển sang query string
    const dataToSignature = createHmac("sha256", process.env.PAYOS_API_SECRET)
      .update(dataQueryStr)
      .digest("hex"); // Tạo chữ ký mới
    return dataToSignature === signature; // So sánh chữ ký
  }
  checkPrefixMultiple(description) {
    if (description.startsWith('LSM')) {
      return 'LSM';
    } else if (description.startsWith('AI')) {
      return 'AI';
    }
    else{
      throw new HttpException('Invalid prefix', HttpStatus.BAD_REQUEST);
    }
  }
  async webhook(type: string, payload: any, signature: string) {
    const url =
      type == "LSM"
        ? `${process.env.DOMAIN_LSM}/webhook/`
        : `${process.env.DOMAIN_AI}/webhook/`;
    const apiResponse = await axios.post(url, {
      data: payload,
      signature: signature,
    });
    return apiResponse.data;
  }
}
