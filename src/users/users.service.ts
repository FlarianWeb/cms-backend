import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

import { AppResponse, formatApiResponse } from '../utils/format-api-response';
import { CustomConflictException } from '../exceptions/custom-conflict.exception';
import { CustomNotFoundException } from '../exceptions/custom-not-found.exception';

@Injectable()
export class UsersService implements OnModuleInit {
	constructor(
		@InjectModel(User)
		private usersRepository: typeof User
	) {}

	async onModuleInit() {
		await this.usersRepository.sync();
	}

	get repository() {
		return this.usersRepository;
	}

	async existingUser(createUserDto: CreateUserDto): Promise<boolean> {
		const user = await this.repository.findOne({
			where: { email: createUserDto.email },
		});

		if (!user) {
			return false;
		}
		return true;
	}

	async hashedPassword(password: string): Promise<string> {
		return await bcrypt.hash(password, 10);
	}

	async createNewUser(createUserDto: CreateUserDto) {
		const hashedPassword = await this.hashedPassword(createUserDto.password);
		return await this.repository.create({
			email: createUserDto.email,
			passwordHash: hashedPassword,
		});
	}

	async userWithoutPassword(user: User): Promise<Omit<User, 'passwordHash'>> {
		const userWithoutPassword = user.get({ plain: true });
		delete userWithoutPassword.passwordHash;
		return userWithoutPassword;
	}

	async create(createUserDto: CreateUserDto): Promise<AppResponse<Omit<User, 'passwordHash'>>> {
		if (await this.existingUser(createUserDto)) {
			throw new CustomConflictException('Email already in use');
		}

		const newUser = await this.createNewUser(createUserDto);

		return formatApiResponse(await this.userWithoutPassword(newUser));
	}

	async findAll(): Promise<AppResponse<Omit<User, 'passwordHash'>[]>> {
		const users = await this.repository.findAll({
			attributes: { exclude: ['passwordHash'] },
		});
		return formatApiResponse(users);
	}

	async findOne(id: number): Promise<AppResponse<Omit<User, 'passwordHash'> | null>> {
		const user = await this.repository.findOne({
			where: { id },
			attributes: { exclude: ['passwordHash'] },
		});
		return formatApiResponse(user);
	}

	async update(
		id: number,
		updateUserDto: CreateUserDto
	): Promise<AppResponse<Omit<User, 'passwordHash'> | null>> {
		await this.repository.update(updateUserDto, {
			where: { id },
		});

		const updatedUser = await this.repository.findByPk(id, {
			attributes: { exclude: ['passwordHash'] },
		});
		return formatApiResponse(updatedUser);
	}

	async remove(id: number): Promise<AppResponse<number>> {
		const result = await this.repository.destroy({ where: { id } });

		if (result) {
			return formatApiResponse(id);
		} else {
			throw new CustomNotFoundException(`User with ID ${id} not found`);
		}
	}
}
