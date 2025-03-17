import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
// import { ValidationPipe } from '@nestjs/common';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // app.useGlobalPipes(new ValidationPipe());
  const x = await app.listen(process.env.PORT ?? 3002);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
