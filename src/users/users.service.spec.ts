import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { getModelToken } from '@nestjs/sequelize';
import { CreateUserDto } from './dto/create-user.dto';

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

	it('should create a user', async () => {
		const createUserDto: CreateUserDto = {
			email: 'test@test.com',
			password: 'password',
		};

		const user: Partial<User> = {
			id: 1,
			email: 'test@test.com',
		};

		userModel.findOne.mockResolvedValue(null);
		userModel.create.mockResolvedValue({
			...user,
			passwordHash: 'hashedpassword',
		});

		const result = await service.create(createUserDto);

		expect(result.data).toEqual(user);
		expect(userModel.create).toHaveBeenCalled();
	});

	// it('should find all users', async () => {
	// 	const users: Omit<User, 'passwordHash'>[] = [
	// 		{
	// 			id: 1,
	// 			email: 'test@test.com',
	// 		},
	// 	];

	// 	userModel.findAll.mockResolvedValue(users);

	// 	const result = await service.findAll();

	// 	expect(result.data).toEqual(users);
	// 	expect(userModel.findAll).toHaveBeenCalled();
	// });

	// it('should find a user by id', async () => {
	// 	const user: Omit<User, 'passwordHash'> = {
	// 		id: 1,
	// 		email: 'test@test.com',
	// 	};

	// 	userModel.findOne.mockResolvedValue(user);

	// 	const result = await service.findOne(1);

	// 	expect(result.data).toEqual(user);
	// 	expect(userModel.findOne).toHaveBeenCalled();
	// });

	// it('should update a user', async () => {
	// 	const updateUserDto: CreateUserDto = {
	// 		email: 'test2@test.com',
	// 		password: 'password2',
	// 	};

	// 	const user: Omit<User, 'passwordHash'> = {
	// 		id: 1,
	// 		email: 'test2@test.com',
	// 	};

	// 	userModel.update.mockResolvedValue([1]);
	// 	userModel.findByPk.mockResolvedValue({
	// 		...user,
	// 		passwordHash: 'hashedpassword2',
	// 		get: () => user,
	// 	});

	// 	const result = await service.update(1, updateUserDto);

	// 	expect(result.data).toEqual(user);
	// 	expect(userModel.update).toHaveBeenCalled();
	// 	expect(userModel.findByPk).toHaveBeenCalled();
	// });

	// it('should remove a user', async () => {
	// 	userModel.destroy.mockResolvedValue(1);

	// 	const result = await service.remove(1);

	// 	expect(result.data).toBeNull();
	// 	expect(userModel.destroy).toHaveBeenCalled();
	// });
});
