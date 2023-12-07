import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { ValidationError } from 'class-validator';
import { Error } from 'mongoose';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();

        const status =
            exception instanceof HttpException
                ? exception.getStatus()
                : exception instanceof ValidationError ||
                    exception instanceof Error.ValidationError
                    ? HttpStatus.BAD_REQUEST
                    : HttpStatus.INTERNAL_SERVER_ERROR;

        const message = this.determineErrorMessage(exception);

        response.status(status).json({
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: request.url,
            message: message,
        });
    }

    private determineErrorMessage(exception: unknown): string {
        if (exception instanceof HttpException) {
            return exception.getResponse() as string;
        } else if (typeof exception === 'object' && exception !== null) {
            const typedException = exception as Record<string, unknown>;
            if (typedException.message) {
                return typeof typedException.message === 'string'
                    ? typedException.message
                    : JSON.stringify(typedException.message);
            }
        }

        return 'Unknown error';
    }
}
