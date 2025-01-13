import { config } from 'dotenv';
config();
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Loại bỏ các thuộc tính không xác định
      forbidNonWhitelisted: true, // Bắt lỗi khi có thuộc tính không xác định
      transform: true, // Chuyển đổi kiểu dữ liệu
    }),
  );
  await app.listen(process.env.SERVICE_PORT || 3000);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
