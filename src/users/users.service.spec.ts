import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { getModelToken } from '@nestjs/sequelize';

describe('UsersService', () => {
	let service: UsersService;
	let userModel: typeof User;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				UsersService,
				{
					provide: getModelToken(User),
					useValue: {
						create: jest.fn().mockResolvedValue({
							appStatus: 1,
							data: { email: 'test@test.com', id: 1 },
							error: null,
						}),
						findAll: jest.fn().mockResolvedValue([
							{
								email: 'test@test.com',
								id: 1,
							},
						]),
						findOne: jest.fn().mockResolvedValue(null),
						// добавьте моки для других методов, которые вы используете в UsersService
					},
				},
			],
		}).compile();

		service = module.get<UsersService>(UsersService);
		userModel = module.get<typeof User>(getModelToken(User));
	});

	it('should call User.findAll and return the result', async () => {
		const expectedResponse = {
			appStatus: 1,
			data: [{ email: 'test@test.com', id: 1 }],
			error: null,
		};

		expect(await service.findAll()).toEqual(expectedResponse);
		expect(userModel.findAll).toBeCalled();
	});

	// Добавьте здесь тесты для других методов
});
