import { ConflictException, Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

// TODO:General shape response
export interface AppResponse<T> {
	status: number;
	data: T | null;
	error: unknown | null;
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
			// throw new ConflictException('Email already in use');

			return {
				status: 1,
				data: null,
				error: new ConflictException('Email already in use'),
			};
		}

		const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
		const newUser = await User.create({ ...createUserDto, passwordHash: hashedPassword });

		const userWithoutPassword = newUser.get({ plain: true });
		delete userWithoutPassword.passwordHash;
		return { status: 1, data: userWithoutPassword, error: null };
	}

	async findAll(): Promise<User[]> {
		return this.usersRepository.findAll();
	}

	async findOne(id: number): Promise<User | null> {
		return this.usersRepository.findOne({ where: { id } });
	}

	async update(id: number, updateUserDto: CreateUserDto): Promise<User> {
		await User.update(updateUserDto, {
			where: { id },
		});

		const updatedUser = await User.findByPk(id);
		return updatedUser;
	}

	async remove(id: number): Promise<void> {
		await this.usersRepository.destroy({ where: { id } });
	}
}
