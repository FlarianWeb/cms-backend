import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService implements OnModuleInit {
	constructor(
		@InjectModel(User)
		private usersRepository: typeof User
	) {}
	async onModuleInit() {
		await this.usersRepository.sync();
	}

	async create(createUserDto: CreateUserDto): Promise<User> {
		const newUser = this.usersRepository.create(createUserDto);
		return newUser;
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
