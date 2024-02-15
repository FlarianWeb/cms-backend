import { Column, Model, Table } from 'sequelize-typescript';
import { ApiProperty } from '@nestjs/swagger';

interface UserCreationAttrs {
	email: string;
	passwordHash: string;
}

@Table({ tableName: 'user_entity' })
export class User extends Model<User, UserCreationAttrs> {
	@ApiProperty()
	@Column({ unique: true })
	email: string;

	@ApiProperty()
	@Column
	passwordHash: string;
}
