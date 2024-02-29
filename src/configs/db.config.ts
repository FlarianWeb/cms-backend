import { ConfigService } from '@nestjs/config';
import { User } from '../users/entities/user.entity';

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
		models: [User],
		logging: console.log,
	};
};
