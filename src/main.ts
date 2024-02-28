import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { CustomValidationException } from './exceptions/custom-validation.exception';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	const port = process.env.APP_PORT || 3030;

	app.useGlobalPipes(
		new ValidationPipe({
			exceptionFactory: errors => {
				return new CustomValidationException(errors);
			},
			stopAtFirstError: true,
		})
	);

	const config = new DocumentBuilder()
		.setTitle('Flarian API')
		.setDescription('The Flarian API')
		.setVersion('1.0')
		.addTag('flarian-api')
		.build();
	const document = SwaggerModule.createDocument(app, config, {
		ignoreGlobalPrefix: true,
	});
	SwaggerModule.setup('/api-docs', app, document);

	app.setGlobalPrefix('api');
	app.enableCors(); // Включение CORS

	app.listen(port, () => {
		console.log(`Server is running on port ${port}`);
	});
}
bootstrap();
