import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { CreateUserDto } from '../src/users/dto/create-user.dto';
import { UpdateUserDto } from 'src/users/dto/update-user.dto';

const testDto: CreateUserDto = {
	email: 'test@mail.com',
	password: 'testPassword123!',
};

const testUpdateDto: UpdateUserDto = {
	email: 'testUpdate@mail.com',
	password: 'testPassword123!Update',
};

describe('AppController (e2e)', () => {
	let app: INestApplication;
	let createdId: string;

	beforeEach(async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AppModule],
		}).compile();

		app = moduleFixture.createNestApplication();
		await app.init();
	});

	afterAll(async () => {
		await app.close();
	});

	it('/users (POST) should create new user', async () => {
		const { body } = await request(app.getHttpServer())
			.post('/users')
			.send(testDto)
			.expect(201);
		createdId = body.data.id;
		expect(createdId).toBeDefined();
	});

	it('/users (POST) should throw error 409 email is used', async () => {
		const { body } = await request(app.getHttpServer())
			.post('/users')
			.send(testDto)
			.expect(409);
		expect(body.error).toBeDefined();
	});

	console.log(createdId, 'createdId before delete');

	it('/users/:id (PATCH) should update user by id', async () => {
		const { body } = await request(app.getHttpServer())
			.patch('/users/' + createdId)
			.send(testUpdateDto)
			.expect(200);

		expect(body.data.email).toEqual(testUpdateDto.email);
	});

	it('/users/:id (GET) should return user by id', async () => {
		const { body } = await request(app.getHttpServer())
			.get('/users/' + createdId)
			.expect(200);

		expect(body.data.id).toEqual(createdId);
	});

	it('/users (GET) should return an array of users', async () => {
		const { body } = await request(app.getHttpServer()).get('/users').expect(200);

		expect(body.data.length).toBeGreaterThan(0);
	});

	it('/users/:id (DELETE) should delete user by id', () => {
		return request(app.getHttpServer())
			.delete('/users/' + createdId)
			.expect(200);
	});
});
