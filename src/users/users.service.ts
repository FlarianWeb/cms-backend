import {
	ConflictException,
	HttpException,
	HttpStatus,
	Injectable,
	OnModuleInit,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

export interface AppResponse<T> {
	appStatus: number;
	data: T | null;
	error: HttpException | null;
}

const formatApiResponse = <T>(
	data: T,
	appStatus: number = 1,
	error: HttpException | null = null
): AppResponse<T> => {
	return { appStatus, data, error };
};

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

			// Добавьте здесь любые дополнительные ключи и свойства, которые вы хотите включить в ответ
		});
	}
}
@Injectable()
export class UsersService implements OnModuleInit {
	constructor(
		@InjectModel(User)
		private usersRepository: typeof User
	) {}
	async onModuleInit() {
		await this.usersRepository.sync();
	}

	async create(createUserDto: CreateUserDto): Promise<AppResponse<Omit<User, 'passwordHash'>>> {
		const existingUser = await User.findOne({ where: { email: createUserDto.email } });
		if (existingUser) {
			throw new CustomConflictException('Email already in use');
		}

		const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
		const newUser = await User.create({ ...createUserDto, passwordHash: hashedPassword });

		const userWithoutPassword = newUser.get({ plain: true });
		delete userWithoutPassword.passwordHash;
		return formatApiResponse(userWithoutPassword);
	}

	async findAll(): Promise<AppResponse<Omit<User, 'passwordHash'>[]>> {
		const users = await this.usersRepository.findAll({
			attributes: { exclude: ['passwordHash'] },
		});
		return formatApiResponse(users);
	}

	async findOne(id: number): Promise<AppResponse<Omit<User, 'passwordHash'> | null>> {
		const user = await this.usersRepository.findOne({
			where: { id },
			attributes: { exclude: ['passwordHash'] },
		});
		return formatApiResponse(user);
	}

	async update(
		id: number,
		updateUserDto: CreateUserDto
	): Promise<AppResponse<Omit<User, 'passwordHash'> | null>> {
		await User.update(updateUserDto, {
			where: { id },
		});

		const updatedUser = await User.findByPk(id, {
			attributes: { exclude: ['passwordHash'] },
		});
		return formatApiResponse(updatedUser);
	}

	async remove(id: number): Promise<AppResponse<null>> {
		await this.usersRepository.destroy({ where: { id } });

		return formatApiResponse(null);
	}
}
