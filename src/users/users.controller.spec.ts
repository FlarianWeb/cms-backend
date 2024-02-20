import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

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
		expect(service.create).toBeCalledTimes(1);
	});

	// Добавьте здесь тесты для других методов
});
