import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcrypt';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
	constructor(
		private readonly jwtService: JwtService,
		private readonly usersService: UsersService
	) {}

	async validateUser(email: string, password: string): Promise<Pick<User, 'email'>> {
		const user = await this.usersService.findUser(email);
		if (!user) {
			throw new UnauthorizedException('User not found');
		}
		const isCorrectPassword = await compare(password, user.data.passwordHash);
		if (!isCorrectPassword) {
			throw new UnauthorizedException('Invalid password');
		}
		return { email: user.data.email };
	}

	async login(email: string) {
		const payload = { email };
		return {
			access_token: await this.jwtService.signAsync(payload),
		};
	}
}
