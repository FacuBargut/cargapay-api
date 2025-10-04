import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dns from 'dns';

dns.setDefaultResultOrder('ipv4first');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: 'http://localhost:3001',
  });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
