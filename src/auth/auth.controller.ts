import {
	Body,
	Controller,
	Get,
	HttpCode,
	Post,
	UsePipes,
	ValidationPipe,
	Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { ApiTags } from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
	constructor(
		private readonly authService: AuthService,
		private readonly usersService: UsersService,
		private readonly jwtService: JwtService
	) {}

	@ApiTags('auth')
	@Post('register')
	async register(@Body() dto: CreateUserDto) {
		return this.usersService.create(dto);
	}

	@ApiTags('auth')
	@UsePipes(new ValidationPipe())
	@HttpCode(200)
	@Post('login')
	async login(@Body() { login, password }: LoginUserDto) {
		const { email } = await this.authService.validateUser(login, password);
		return this.authService.login(email);
	}

	@ApiTags('auth')
	@Get('auth-status')
	async authStatus(@Request() req: Request) {
		console.log(req, 'req');

		return this.authService.userStatus(req);
	}
}
