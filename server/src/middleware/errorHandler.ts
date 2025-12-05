import type { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
	statusCode: number;
	isOperational: boolean;

	constructor(message: string, statusCode: number = 500) {
		super(message);
		this.statusCode = statusCode;
		this.isOperational = true;
		Error.captureStackTrace(this, this.constructor);
	}
}

export function errorHandler(
	err: Error | AppError,
	_req: Request,
	res: Response,
	_next: NextFunction
): void {
	if (err instanceof AppError) {
		res.status(err.statusCode).json({
			message: err.message,
		});
		return;
	}

	// Unknown errors
	console.error('Unhandled error:', err);
	res.status(500).json({
		message: 'Internal server error',
	});
}

