import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';

describe('UsersController', () => {
	let controller: UsersController;
	let service: UsersService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [UsersController],
			providers: [
				{
					provide: UsersService,
					useValue: {
						create: jest.fn().mockResolvedValue('create'),
						findAll: jest.fn().mockResolvedValue('findAll'),
						findOne: jest.fn().mockResolvedValue('findOne'),
						update: jest.fn().mockResolvedValue('update'),
						remove: jest.fn().mockResolvedValue('remove'),
					},
				},
			],
		}).compile();

		controller = module.get<UsersController>(UsersController);
		service = module.get<UsersService>(UsersService);
	});

	it('should call UsersService.create and return the result.', async () => {
		expect(await controller.create({} as any)).toBe('create');
		expect(service.create).toHaveBeenCalledTimes(1);
	});

	it('should create a user', async () => {
		const dto: CreateUserDto = {
			email: 'test@test.com',
			password: 'testPassword',
		};

		const user: Partial<User> = {
			id: 1,
			email: dto.email,
		};

		jest.spyOn(service, 'create').mockResolvedValue(user as any);

		expect(await controller.create(dto)).toBe(user);
	});
});
