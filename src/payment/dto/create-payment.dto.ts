import { IsIn, IsNumber, IsString } from 'class-validator';

export class CreatePaymentDto {
  @IsNumber()
  orderCode: number;
  @IsNumber()
  amount: number;
  @IsIn([0, 1], { message: 'Value must be either 0 or 1' })
  type: number;
}
