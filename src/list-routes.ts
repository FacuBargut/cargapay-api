import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { INestApplication } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';

async function listRoutes() {
  const app: INestApplication = await NestFactory.create(AppModule, new ExpressAdapter(), { logger: false });
  const server = app.getHttpServer();
  const router = server._events.request._router;

  console.log('--- RUTAS REGISTRADAS ---');
  router.stack
    .filter((layer) => layer.route)
    .forEach((layer) => {
      const path = layer.route.path;
      const method = layer.route.stack[0].method.toUpperCase();
      console.log(`${method.padEnd(7)} ${path}`);
    });
  console.log('-------------------------');

  await app.close();
}

listRoutes();