import { HttpException, HttpStatus } from '@nestjs/common';

export class CustomValidationException extends HttpException {
	constructor(errors: any[]) {
		super(
			{
				appStatus: 0,
				data: null,
				errors: {
					status: HttpStatus.BAD_REQUEST,
					error: 'Validation',
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
