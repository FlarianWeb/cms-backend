import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { getModelToken } from '@nestjs/sequelize';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt', () => ({
	hash: jest.fn(),
}));

describe('UsersService', () => {
	let service: UsersService;
	let userModel: any;

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
	});

	it('should return true if user exists', async () => {
		const createUserDto: CreateUserDto = {
			email: 'existing@test.com',
			password: 'password',
		};

		userModel.findOne.mockResolvedValue({ id: 1, email: 'existing@test.com' });

		expect(await service.existingUser(createUserDto)).toBe(true);
	});

	it('should return false if user does not exist', async () => {
		const createUserDto: CreateUserDto = {
			email: 'nonexisting@test.com',
			password: 'password',
		};

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
		const createUserDto: CreateUserDto = {
			email: 'test@test.com',
			password: 'password',
		};

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
});
