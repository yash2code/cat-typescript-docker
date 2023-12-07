import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from './filters/all-exceptions-filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({
    transform: true, // auto-transform request payloads to match the DTO classes
    whitelist: true, // remove additional properties that aren't in the DTO
    forbidNonWhitelisted: true, // throw an error when non-whitelisted properties are passed
    exceptionFactory: (errors) => {
      const formattedErrors = errors.map(error => ({
        field: error.property,
        constraints: error.constraints
      }));
      return new BadRequestException(formattedErrors);
    }
  }));
  app.useGlobalFilters(new AllExceptionsFilter());


  await app.listen(3000);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
