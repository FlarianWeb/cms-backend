import { ConflictException, HttpStatus } from '@nestjs/common';

export class CustomConflictException extends ConflictException {
	constructor(message: string) {
		super({
			statusApp: 0,
			data: null,
			error: {
				status: HttpStatus.CONFLICT,
				error: 'Conflict',
				message: message,
			},
		});
	}
}
