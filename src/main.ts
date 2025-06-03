import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  /* Habilita los CORS */
  app.enableCors(); 

  /* Valida que toda la data que llegue en por http sea igual a como esta en el DTO */
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // elimina automáticamente todas las propiedades que estén definidas en el DTO
      forbidNonWhitelisted: true // Lanzara un error 400 si encuentra propiedades no esperadas
    })
  )

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
