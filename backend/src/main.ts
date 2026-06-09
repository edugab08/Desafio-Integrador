import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({ origin: ['http://localhost:3000'], methods: ['GET','POST','PUT','PATCH','DELETE'] });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true, transformOptions: { enableImplicitConversion: true } }));
  app.setGlobalPrefix('api/v1');
  const config = new DocumentBuilder().setTitle('DataSight API').setDescription('API do sistema DataSight').setVersion('1.0').addTag('Dashboard').addTag('Clientes').addTag('Produtos').addTag('Pedidos').addTag('Relatorios').build();
  SwaggerModule.setup('api/docs', app, SwaggerModule.createDocument(app, config));
  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  console.log(`Backend rodando em http://localhost:${port}`);
  console.log(`Swagger em http://localhost:${port}/api/docs`);
}
bootstrap();
