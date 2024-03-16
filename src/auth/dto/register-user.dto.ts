import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterUserDto {
	@IsEmail()
	@IsNotEmpty()
	@ApiProperty()
	login: string;

	@IsNotEmpty()
	@MinLength(8)
	@ApiProperty()
	password: string;
}
