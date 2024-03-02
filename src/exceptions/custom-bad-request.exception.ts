import { BadRequestException, HttpStatus } from '@nestjs/common';

export class CustomBadRequestException extends BadRequestException {
	constructor(message: string) {
		super({
			statusApp: 0,
			data: null,
			error: {
				status: HttpStatus.CONFLICT,
				error: 'Bad Request',
				message: message,
			},
		});
	}
}
