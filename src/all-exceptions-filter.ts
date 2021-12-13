import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
export class ValidateResponse {
  statusCode: number
  message: any
  error: string
}
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    console.log(exception);
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    const mes = exception instanceof HttpException
      ? exception.getResponse() as ValidateResponse
      : new ValidateResponse();
    response.status(status).json({
      statusCode: status,
      message: (typeof mes.message == 'string') ? this.getMessage(mes.message) : this.getMessage(mes.message && mes.message[0] ? mes.message[0] : ''),
      timestamp: new Date().toISOString(),
      error: mes.error,
    });
  }

  getMessage(message: string) {
    let result = message.toLowerCase().replace(/\s/g, '_');

    if (result.indexOf('must_be_a_mongodb_id') !== -1) {
      result = result.replace('must_be_a_mongodb_id', 'invalid');
    }
    if (result.indexOf('must_be_a_number_conforming_to_the_specified_constraints') !== -1) {
      result = result.replace('must_be_a_number_conforming_to_the_specified_constraints', 'must_be_a_number');
    }

    return result;
  }
}