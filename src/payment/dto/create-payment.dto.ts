import { IsInt, IsNumber, Max, Min } from 'class-validator';

export class CreatePaymentDto {
  @IsNumber()
  amount: number;
  @IsInt()
  @Min(0, {
    message: 'Value must be at least 0',
  })
  @Max(1, {
    message: 'Value must be at most 1',
  })
  type: number;
}
