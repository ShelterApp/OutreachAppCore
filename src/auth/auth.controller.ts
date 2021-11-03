import { Controller, Post, UseGuards, Request, Body, UseInterceptors, Res, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { LocalAuthGuard } from './local-auth.guard';
import { AuthService } from './auth.service';
import { ApiBadRequestResponse, ApiBody, ApiCreatedResponse, ApiForbiddenResponse, ApiOkResponse, ApiOperation, ApiParam, ApiProperty, ApiResponse, ApiTags, ApiUnprocessableEntityResponse } from '@nestjs/swagger';
import { CreateUserDto } from './dto/create-user.dto';
import { UserRole, UserVerify } from 'src/enum';
import { LoginSchema, RegisterSchema, ResendEmailVerification, VerifyToken } from './swagger-schema';
import { User } from 'src/users/schema/user.schema';
import ConfirmEmailDto from './dto/confirm-email.dto';
import { SanitizeMongooseModelInterceptor } from 'nestjs-mongoose-exclude';
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
    async register(@Body() registerUser: CreateUserDto): Promise<any> {
        const user = await this.authService.register(registerUser);
        await this.authService.sendEmailVerification(user.email);

        return user;
    }

    @Post('confirm/email')
    @ApiOperation({ summary: 'Confirm Email' })
    @ApiResponse({ status: 201, description: 'The email confirm successful.'})
    @ApiBadRequestResponse({ status: 400, description: 'The email confirm error.'})
    @ApiUnprocessableEntityResponse({ status: 422, description: 'Parameter invalid.'})
    async confirm(@Body() confirmationData: ConfirmEmailDto, @Res() res: Response) {
        const email = await this.authService.decodeConfirmationToken(confirmationData.token);
        await this.authService.confirmEmail(email);
        res.status(HttpStatus.CREATED).send();
    }

}
