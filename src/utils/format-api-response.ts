import { HttpException } from '@nestjs/common';

export interface AppResponse<T> {
	appStatus: number;
	data: T | null;
	error: HttpException | null;
}

export const formatApiResponse = <T>(
	data: T,
	appStatus: number = 1,
	error: HttpException | null = null
): AppResponse<T> => {
	return { appStatus, data, error };
};
