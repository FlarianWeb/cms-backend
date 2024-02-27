import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { getModelToken } from '@nestjs/sequelize';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { formatApiResponse } from '../utils/format-api-response';

jest.mock('bcrypt', () => ({
	hash: jest.fn(),
}));

describe('UsersService', () => {
	let service: UsersService;
	let userModel: any;
	let createUserDto: CreateUserDto;

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

			await expect(service.create(createUserDto)).rejects.toThrow(
				'Custom Conflict Exception'
			);
		});

		it('should create a new user if the user does not exist', async () => {
			const newUser: Partial<User> = {
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
});
