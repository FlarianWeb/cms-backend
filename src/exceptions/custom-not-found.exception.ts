import { HttpStatus, NotFoundException } from '@nestjs/common';

export class CustomNotFoundException extends NotFoundException {
	constructor(message: string) {
		super({
			statusApp: 0,
			data: null,
			error: {
				status: HttpStatus.NOT_FOUND,
				error: 'Not found',
				message: message,
			},
		});
	}
}
