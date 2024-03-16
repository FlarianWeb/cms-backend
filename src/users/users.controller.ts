import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Param,
	Delete,
	HttpCode,
	UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { ApiTags } from '@nestjs/swagger';

@Controller('users')
export class UsersController {
	constructor(private readonly usersService: UsersService) {}

	@ApiTags('users')
	@Post()
	@HttpCode(201)
	@UseGuards(JwtAuthGuard)
	create(@Body() createUserDto: CreateUserDto) {
		return this.usersService.create(createUserDto);
	}

	@ApiTags('users')
	@Get()
	@UseGuards(JwtAuthGuard)
	findAll() {
		return this.usersService.findAll();
	}

	@ApiTags('users')
	@Get(':id')
	@UseGuards(JwtAuthGuard)
	findOne(@Param('id') id: string) {
		return this.usersService.findOne(+id);
	}

	@ApiTags('users')
	@Patch(':id')
	@UseGuards(JwtAuthGuard)
	update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
		return this.usersService.update(+id, updateUserDto);
	}

	@ApiTags('users')
	@Delete(':id')
	@UseGuards(JwtAuthGuard)
	remove(@Param('id') id: string) {
		return this.usersService.remove(+id);
	}
}
