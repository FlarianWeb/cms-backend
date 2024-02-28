import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { getModelToken } from '@nestjs/sequelize';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { formatApiResponse } from '../utils/format-api-response';
import { CustomConflictException } from '../exceptions/custom-conflict.exception';
import { CustomNotFoundException } from '../exceptions/custom-not-found.exception';

jest.mock('bcrypt', () => ({
	hash: jest.fn(),
}));

describe('UsersService', () => {
	let service: UsersService;
	let userModel: any;
	let createUserDto: CreateUserDto;
	let users;

	beforeEach(async () => {
		const UserModelMock = {
			findOne: jest.fn(),
			create: jest.fn(),
			findAll: jest.fn(),
			update: jest.fn(),
			findByPk: jest.fn(),
			destroy: jest.fn(),
		};

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				UsersService,
				{
					provide: getModelToken(User),
					useValue: UserModelMock,
				},
			],
		}).compile();

		service = module.get<UsersService>(UsersService);
		userModel = module.get<typeof User>(getModelToken(User));
		createUserDto = {
			email: 'test@test.com',
			password: 'password',
		};
		users = [
			{ id: 1, email: 'user1@test.com' },
			{ id: 2, email: 'user2@test.com' },
		];
	});

	describe('create', () => {
		it('should return true if user exists', async () => {
			userModel.findOne.mockResolvedValue({ id: 1, email: 'existing@test.com' });

			expect(await service.existingUser(createUserDto)).toBe(true);
		});

		it('should return false if user does not exist', async () => {
			userModel.findOne.mockResolvedValue(null);

			const result = await service.existingUser(createUserDto);

			expect(result).toBe(false);
		});

		it('should return a hashed password', async () => {
			const password = 'password';
			const hashedPassword = 'hashedpassword';

			(bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

			const result = await service.hashedPassword(password);

			expect(result).toEqual(hashedPassword);
			expect(bcrypt.hash).toHaveBeenCalledWith(password, 10);
		});

		it('should create a new user', async () => {
			const hashedPassword = 'hashedpassword';

			service.hashedPassword = jest.fn().mockResolvedValue(hashedPassword);
			userModel.create.mockResolvedValue({ ...createUserDto, passwordHash: hashedPassword });

			const result = await service.createNewUser(createUserDto);

			expect(result).toEqual({ ...createUserDto, passwordHash: hashedPassword });
			expect(service.hashedPassword).toHaveBeenCalledWith(createUserDto.password);
			expect(userModel.create).toHaveBeenCalledWith({
				email: createUserDto.email,
				passwordHash: hashedPassword,
			});
		});

		it('should throw an error if the user already exists', async () => {
			service.existingUser = jest.fn().mockResolvedValue(true);

			await expect(service.create(createUserDto)).rejects.toThrow(CustomConflictException);
		});

		it('should create a new user if the user does not exist', async () => {
			const newUser = {
				id: 1,
				email: 'new@test.com',
			};

			service.existingUser = jest.fn().mockResolvedValue(false);
			service.createNewUser = jest.fn().mockResolvedValue(newUser);
			service.userWithoutPassword = jest.fn().mockResolvedValue(newUser);

			const result = await service.create(createUserDto);

			expect(result).toEqual(formatApiResponse(newUser));
		});
	});

	describe('findAll', () => {
		it('should return all users without password hashes', async () => {
			jest.spyOn(service.repository, 'findAll').mockResolvedValue(users as User[]);

			const result = await service.findAll();

			expect(result).toEqual(formatApiResponse(users));
		});
	});

	describe('findOne', () => {
		it('should return a user by id without password hash', async () => {
			const id = 1;
			const user = {
				id: 1,
				email: 'test@test.com',
			};

			jest.spyOn(service.repository, 'findOne').mockResolvedValue(user as User);

			const result = await service.findOne(id);

			expect(result).toEqual(formatApiResponse(user));
			expect(service.repository.findOne).toHaveBeenCalledWith({
				where: { id },
				attributes: { exclude: ['passwordHash'] },
			});
		});
	});

	describe('update', () => {
		it('should update a user and return the updated user without password hash', async () => {
			const id = 1;
			const updateUserDto: CreateUserDto = {
				email: 'updated@test.com',
				password: 'updatedPassword',
			};

			const updatedUser = {
				id: id,
				email: updateUserDto.email,
			};

			jest.spyOn(service.repository, 'update').mockResolvedValue([1]);
			jest.spyOn(service.repository, 'findByPk').mockResolvedValue(updatedUser as User);

			const result = await service.update(id, updateUserDto);

			expect(result).toEqual(formatApiResponse(updatedUser));
			expect(service.repository.update).toHaveBeenCalledWith(updateUserDto, {
				where: { id },
			});
			expect(service.repository.findByPk).toHaveBeenCalledWith(id, {
				attributes: { exclude: ['passwordHash'] },
			});
		});
	});

	describe('remove', () => {
		it('should remove a user by id and return the id', async () => {
			const id = 1;

			jest.spyOn(service.repository, 'destroy').mockResolvedValue(1);

			const result = await service.remove(id);

			expect(result).toEqual(formatApiResponse(id));
			expect(service.repository.destroy).toHaveBeenCalledWith({ where: { id } });
		});

		it('should throw CustomNotFoundException when user not found', async () => {
			const id = 1;

			jest.spyOn(service.repository, 'destroy').mockResolvedValue(0);

			await expect(service.remove(id)).rejects.toThrow(CustomNotFoundException);
			expect(service.repository.destroy).toHaveBeenCalledWith({ where: { id } });
		});
	});
});
