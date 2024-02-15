import { ConfigService } from '@nestjs/config';

// TODO: 'fix this function to return the config Promise<any>';

export const getConfigDB = async (configService: ConfigService): Promise<any> => {
	return {
		dialect: 'mysql',
		host: configService.get('DB_HOST'),
		port: configService.get('DB_PORT'),
		username: configService.get('DB_USER'),
		password: configService.get('DB_PASSWORD'),
		database: configService.get('DB_NAME'),
		synchronize: true,
		models: [
			// User, Category, Post, Tag, Page, PostTag, FileInfo
		],
		logging: console.log,
	};
};
