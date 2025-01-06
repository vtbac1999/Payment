import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import axios from "axios";
import { createHmac } from "crypto";
@Injectable()
export class PaymentService {
  private readonly baseUrl: string;
  private readonly apiKey: string;

  constructor() {
    this.baseUrl = process.env.PAYOS_BASE_URL;
    this.apiKey = process.env.PAYOS_API_KEY;
  }

  // Tạo đơn hàng
  async createPaymentOrder(amount: number) {
    try {
      const description = await this.generateDescription();
      const dataToSignature = await this.createSignature({
        amount,
        orderCode: Number(String(new Date().getTime()).slice(-6)),
        description,
        cancelUrl: "http://localhost:3000",
        returnUrl: "http://localhost:3000",
      })
      const response = await axios.post(
        `${this.baseUrl}/payment-requests`,
        {
          amount,
          orderCode: Number(String(new Date().getTime()).slice(-6)),
          description,
          cancelUrl: "http://localhost:3000",
          returnUrl: "http://localhost:3000",
          signature: dataToSignature,
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
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
  async generateDescription() {
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"; // Các ký tự có thể dùng
    const length = 6; // Độ dài chuỗi mong muốn
    let result = "";

    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length); // Random vị trí
      result += characters[randomIndex];
    }
    const description = "LIT" + result;
    return description;
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
  async createSignature(data: any){
    const sortedDataByKey = this.sortObjDataByKey(data); // Sắp xếp key của object
    const dataQueryStr = this.convertObjToQueryStr(sortedDataByKey); // Chuyển sang query string
    const dataToSignature = createHmac("sha256", process.env.PAYOS_API_SECRET)
      .update(dataQueryStr)
      .digest("hex"); // Tạo chữ ký mới
      return dataToSignature;
  }

  async validateWebhook(data: Record<string, any>, signature: string): Promise<boolean> {
   const dataToSignature = await this.createSignature(data);
    return dataToSignature === signature; // So sánh chữ ký
  }
}
