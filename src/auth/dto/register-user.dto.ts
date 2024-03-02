import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class RegisterUserDto {
	@IsEmail()
	@IsNotEmpty()
	login: string;

	@IsNotEmpty()
	@MinLength(8)
	password: string;
}
