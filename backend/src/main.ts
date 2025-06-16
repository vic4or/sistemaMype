import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
//import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Validación global
  //app.useGlobalPipes(new ValidationPipe({
    //whitelist: true,
    //forbidNonWhitelisted: true,
    //transform: true,
  //}));

  app.enableCors({
    origin: '*',//'http://localhost:3001',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Swagger
  //const config = new DocumentBuilder()
    //.setTitle('Sistema de Inventario API')
    //.setDescription('API para sistema de inventario')
    //.setVersion('1.0')
    //.addBearerAuth()
  //  .build();
  //const document = SwaggerModule.createDocument(app, config);
  //SwaggerModule.setup('api', app, document);
  app.setGlobalPrefix('api')
  await app.listen(process.env.PORT || 3001);
}
bootstrap();
