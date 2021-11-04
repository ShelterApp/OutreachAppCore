import { Controller, Post, UseGuards, Request, Body, UseInterceptors, Res, HttpStatus, UnprocessableEntityException } from '@nestjs/common';
import { Response } from 'express';
import { LocalAuthGuard } from './local-auth.guard';
import { AuthService } from './auth.service';
import { ApiBadRequestResponse, ApiBody, ApiCreatedResponse, ApiForbiddenResponse, ApiOkResponse, ApiOperation, ApiParam, ApiProperty, ApiResponse, ApiTags, ApiUnprocessableEntityResponse } from '@nestjs/swagger';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginSchema, RegisterSchema, ResendEmailVerification, VerifyToken } from './swagger-schema';
import ConfirmEmailDto from './dto/confirm-email.dto';
import { SanitizeMongooseModelInterceptor } from 'nestjs-mongoose-exclude';
import ForgotPasswordDto from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
@ApiTags('Authentication')
@UseInterceptors(new SanitizeMongooseModelInterceptor({excludeMongooseId: false, excludeMongooseV: true}))
@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService
    ) { }

    @UseGuards(LocalAuthGuard)
    @Post('login')
    @ApiOperation({ summary: 'Login' })
    @ApiBody(LoginSchema.ApiBody)
    @ApiOkResponse()
    login(@Request() req): any {
        return this.authService.login(req.user)
    }

    @Post('register')
    @ApiOperation({ summary: 'Register users' })
    @ApiResponse({ status: 200, description: 'object user'})
    @ApiBadRequestResponse({ status: 400, description: 'Bad request'})
    @ApiUnprocessableEntityResponse({ status: 422, description: 'Unprocessable Entity'})
    async register(@Body() registerUserDto: RegisterUserDto): Promise<any> {
        const user = await this.authService.register(registerUserDto);
        await this.authService.sendEmailVerification(user.email);

        return user;
    }

    @Post('confirm-email')
    @ApiOperation({ summary: 'Confirm Email' })
    @ApiResponse({ status: 203, description: 'no content.'})
    @ApiBadRequestResponse({ status: 400, description: 'The email confirm error.'})
    @ApiUnprocessableEntityResponse({ status: 422, description: 'Parameter invalid.'})
    async confirm(@Body() confirmationDataDto: ConfirmEmailDto, @Res() res: Response) {
        const email = await this.authService.decodeConfirmationToken(confirmationDataDto.token);
        await this.authService.confirmEmail(email);
        res.status(HttpStatus.NO_CONTENT).send();
    }

    @Post('forgot-password')
    @ApiOperation({ summary: 'Register users' })
    @ApiResponse({ status: 204, description: 'no content'})
    @ApiBadRequestResponse({ status: 400, description: 'Bad request'})
    @ApiUnprocessableEntityResponse({ status: 422, description: 'Unprocessable Entity'})
    async forgetPassword(@Body() forgetPasswordDto: ForgotPasswordDto, @Res() res: Response): Promise<any> {
        await this.authService.sendForgotPasswordEmail(forgetPasswordDto.email);
        res.status(HttpStatus.NO_CONTENT).send();
    }

    @Post('reset-password')
    @ApiOperation({ summary: 'Register users' })
    @ApiResponse({ status: 204, description: 'no content'})
    @ApiBadRequestResponse({ status: 400, description: 'Bad request'})
    @ApiUnprocessableEntityResponse({ status: 422, description: 'Unprocessable Entity'})
    async resetPassword(@Body() resetPasswordDto: ResetPasswordDto, @Res() res: Response): Promise<any> {
        await this.authService.resetPassword(resetPasswordDto.token, resetPasswordDto.password);
        res.status(HttpStatus.NO_CONTENT).send();
    }
}
