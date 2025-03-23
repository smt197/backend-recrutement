import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { seedAdmin } from './seeders/admin-seeder';
// import { ForbiddenFilter } from './filters/forbidden.filter';

// import { ValidationPipe } from '@nestjs/common';


async function bootstrap() {
  // await seedAdmin();
  const app = await NestFactory.create(AppModule);
  // app.useGlobalFilters(new ForbiddenFilter()); // Appliquer le filtre globalement
  // app.useGlobalPipes(new ValidationPipe());
  const x = await app.listen(process.env.PORT ?? 3002);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
