import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { HttpException, HttpStatus, ValidationPipe } from '@nestjs/common';

export class CustomValidationException extends HttpException {
	constructor(errors: any[]) {
		super(
			{
				appStatus: 0,
				data: null,
				errors: {
					status: HttpStatus.BAD_REQUEST,
					message: errors.map(error => ({
						property: error.property,
						message: error.constraints[Object.keys(error.constraints)[0]],
					})),
				},
			},
			HttpStatus.BAD_REQUEST
		);
	}
}

async function bootstrap() {
	const app = await NestFactory.create(AppModule);

	app.useGlobalPipes(
		new ValidationPipe({
			exceptionFactory: errors => {
				return new CustomValidationException(errors);
			},
			stopAtFirstError: true,
		})
	);

	const config = new DocumentBuilder()
		.setTitle('Lawyer API')
		.setDescription('The Lawyer API description')
		.setVersion('1.0')
		// .addTag('lawyer-api')
		.build();
	const document = SwaggerModule.createDocument(app, config, {
		ignoreGlobalPrefix: true,
	});
	SwaggerModule.setup('/api-docs', app, document);

	app.setGlobalPrefix('api');
	app.enableCors(); // Включение CORS

	await app.listen(3000);
}
bootstrap();
